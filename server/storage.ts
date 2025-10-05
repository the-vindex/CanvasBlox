export interface IStorage {
    [key: string]: never;
}

export class MemStorage implements IStorage {
    [key: string]: never;
}

export const storage = new MemStorage();
