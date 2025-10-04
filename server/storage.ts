// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type IStorage = Record<string, never>;

export class MemStorage implements IStorage {}

export const storage = new MemStorage();
