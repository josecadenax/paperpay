export function encodeBase64Json(data: unknown): string {
  const jsonStr = JSON.stringify(data);
  return Buffer.from(jsonStr, 'utf-8').toString('base64');
}

export function decodeBase64Json<T = unknown>(base64Str: string): T {
  const jsonStr = Buffer.from(base64Str, 'base64').toString('utf-8');
  return JSON.parse(jsonStr) as T;
}
