// Simple E2EE utilities leveraging Web Crypto API (ECDH + AES-GCM).
// Keys are stored per-user in localStorage; public keys may be stored in Firestore via chatService.

export interface E2EEContext {
  getOrCreateKeyPair: () => Promise<CryptoKeyPair>;
  exportPublicJwk: (key: CryptoKey) => Promise<JsonWebKey>;
  importPublicJwk: (jwk: JsonWebKey) => Promise<CryptoKey>;
  deriveSharedKey: (privateKey: CryptoKey, peerPublicKey: CryptoKey) => Promise<CryptoKey>;
  encrypt: (sharedKey: CryptoKey, text: string) => Promise<{ ciphertext: string; iv: string }>;
  decrypt: (sharedKey: CryptoKey, ciphertextB64: string, ivB64: string) => Promise<string>;
}

const STORAGE_KEY = 'timebank_e2ee_keypair';

async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

async function exportKeyPair(pair: CryptoKeyPair) {
  const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const priv = await crypto.subtle.exportKey('jwk', pair.privateKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ pub, priv }));
}

async function importKeyPair(): Promise<CryptoKeyPair | null> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const { pub, priv } = JSON.parse(raw);
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      pub,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );
    const privateKey = await crypto.subtle.importKey(
      'jwk',
      priv,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    );
    return { publicKey, privateKey } as CryptoKeyPair;
  } catch {
    return null;
  }
}

function toB64(arr: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(arr)));
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function useE2EE(): E2EEContext {
  return {
    getOrCreateKeyPair: async () => {
      let pair = await importKeyPair();
      if (!pair) {
        pair = await generateKeyPair();
        await exportKeyPair(pair);
      }
      return pair;
    },
    exportPublicJwk: (key: CryptoKey) => crypto.subtle.exportKey('jwk', key),
    importPublicJwk: (jwk: JsonWebKey) => crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, true, []),
    deriveSharedKey: async (privateKey: CryptoKey, peerPublicKey: CryptoKey) => {
      return crypto.subtle.deriveKey(
        { name: 'ECDH', public: peerPublicKey },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    },
    encrypt: async (sharedKey: CryptoKey, text: string) => {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder().encode(text);
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sharedKey, enc);
      return { ciphertext: toB64(ct), iv: toB64(iv.buffer) };
    },
    decrypt: async (sharedKey: CryptoKey, ciphertextB64: string, ivB64: string) => {
      const ct = fromB64(ciphertextB64);
      const iv = fromB64(ivB64);
      const pt = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        sharedKey,
        ct as unknown as BufferSource
      );
      return new TextDecoder().decode(pt);
    },
  };
}
