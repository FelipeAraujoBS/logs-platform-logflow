import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { Db } from 'mongodb'
import { healthRoutes } from './routes/health.routes'
import { makeLogRoutes } from './routes/log.routes'

export async function buildServer(db: Db): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: 'info',
    },
  })

  await app.register(cors, {
    origin: 'http://localhost:4200',
    methods: ['GET'],
  })

  await app.register(websocket)

  await app.register(healthRoutes,        { prefix: '/api/v1' })
  await app.register(makeLogRoutes(db),   { prefix: '/api/v1' })

  return app
}