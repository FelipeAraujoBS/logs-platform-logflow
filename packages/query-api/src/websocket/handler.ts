import { Db } from 'mongodb'
import { FastifyInstance } from 'fastify'

export function registerWebSocket(app: FastifyInstance, db: Db): void {
  app.get('/api/v1/logs/stream', { websocket: true }, (socket, request) => {
    console.log('Cliente WebSocket conectado')

    const changeStream = db.collection('logs').watch([], {
      fullDocument: 'updateLookup',
    })

    changeStream.on('change', (change) => {
      if (change.operationType === 'insert') {
        const log = change.fullDocument
        socket.send(JSON.stringify(log))
      }
    })

    socket.on('close', () => {
      console.log('Cliente WebSocket desconectado')
      changeStream.close()
    })

    socket.on('error', (error: Error) => {
      console.error('Erro no WebSocket:', error)
      changeStream.close()
    })
  })
}