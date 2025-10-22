import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadServiceImages(serviceId: string, files: File[]): Promise<string[]> {
  if (!storage) throw new Error('Firebase Storage not initialized');
  const urls: string[] = [];
  for (const file of files) {
    const fileRef = ref(storage, `service-images/${serviceId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    urls.push(url);
  }
  return urls;
}
