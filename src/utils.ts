export function stripSubject(subject: string): string {
  return subject
    .replace(/\[.*\]/g, '')
    .replace(/.*:/g, '')
    .replace(/\s+/g, '');
}
