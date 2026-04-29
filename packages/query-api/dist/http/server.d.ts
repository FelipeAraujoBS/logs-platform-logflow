import { FastifyInstance } from 'fastify';
import { Db } from 'mongodb';
export declare function buildServer(db: Db): Promise<FastifyInstance>;
