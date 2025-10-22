export async function mediateTerms(messages: string[], context?: { serviceTitle?: string; participants?: string[] }): Promise<string> {
  const base = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
  const resp = await fetch(`${base}/api/ai/mediate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, serviceTitle: context?.serviceTitle, participants: context?.participants }),
  });
  if (!resp.ok) {
    throw new Error('AI mediator request failed');
  }
  const data = await resp.json();
  return data.reply as string;
}
