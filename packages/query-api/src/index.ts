import { connectDatabase, disconnectDatabase } from './database/connection'
import { buildServer } from './http/server'
import { registerWebSocket } from './websocket/handler'
import { env } from './config/env'

async function main(): Promise<void> {
  try {
    const db = await connectDatabase()
    const app = await buildServer(db)

    registerWebSocket(app, db)

    await app.listen({
      port: env.http.port,
      host: '0.0.0.0',
    })

    console.log(`Query API rodando na porta ${env.http.port}`)

    process.on('SIGTERM', async () => {
      console.log('Encerrando query-api...')
      await app.close()
      await disconnectDatabase()
      process.exit(0)
    })

    process.on('SIGINT', async () => {
      console.log('Encerrando query-api...')
      await app.close()
      await disconnectDatabase()
      process.exit(0)
    })
  } catch (error) {
    console.error('Erro ao inicializar a query-api:', error)
    process.exit(1)
  }
}

main()