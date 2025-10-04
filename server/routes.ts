import { createServer, type Server } from 'node:http';
import type { Express } from 'express';

export async function registerRoutes(app: Express): Promise<Server> {
    // put application routes here
    // prefix all routes with /api

    // use storage to perform CRUD operations on the storage interface
    // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

    const httpServer = createServer(app);

    return httpServer;
}
