import { FastifyInstance } from 'fastify';
import { Db } from 'mongodb';
export declare function makeLogRoutes(db: Db): (app: FastifyInstance) => Promise<void>;
