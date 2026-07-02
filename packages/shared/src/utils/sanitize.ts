export function sanitizeFilterValue(value: string): string {
  return value.replace(/[\$\.]/g, "");
}
