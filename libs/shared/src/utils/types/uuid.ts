export type UUID = string & { __uuidBrand: never };

export function castToUUID(id: string): UUID {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid UUID format');
  }
  return id as UUID;
}
