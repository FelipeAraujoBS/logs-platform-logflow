import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

function optional(key: string, fallback: string): string{
    return process.env[key] ?? fallback
}

export const env = {
    http: {
        port: Number(optional('HTTP_PORT', '3001'))
    },
    mongodb: {
        uri: optional('MONGODB_URI', 'mongodb://admin:admin@localhost:27017/logflow?authSource=admin'),
        dbName: optional('MONGODB_DB', 'logflow')
    }
} as const