# logflow

Plataforma centralizada de gerenciamento de logs e telemetria construída para cargas de trabalho em produção. O logflow recebe logs de qualquer aplicação via HTTP ou gRPC, os armazena em buffer através de uma fila Redis e os persiste no MongoDB, expondo uma API de consulta e um dashboard Angular em tempo real para filtragem, monitoramento e análise.

## Arquitetura

```
[Aplicações] → HTTP / gRPC → [Ingestor] → [BullMQ / Redis] → [Worker] → [MongoDB]
                                                                               ↓
                                                    [Dashboard Angular] ← [Query API]
```

O sistema é construído em torno de uma separação clara de responsabilidades: o ingestor é otimizado para ingestão de baixa latência, a fila desacopla a ingestão da persistência, e o worker lida com escritas em batch no MongoDB de forma independente.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Ingestor | Node.js, TypeScript, Fastify, gRPC |
| Fila | BullMQ, Redis |
| Worker | Node.js, TypeScript |
| Banco de dados | MongoDB |
| Dashboard | Angular |
| Infraestrutura | Docker, Docker Compose |

## Estrutura do Projeto

```
logflow/
  packages/
    shared/       # Tipos e interfaces TypeScript compartilhados
    ingestor/     # Servidor de ingestão HTTP e gRPC (Fastify)
    worker/       # Consumidor BullMQ e escritor MongoDB
    query-api/    # Servidor de consulta REST e WebSocket
    dashboard/    # Dashboard Angular
  proto/
    log.proto     # Definição do contrato gRPC
  docker-compose.yml
```

## Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/FelipeAraujoBS/logflow
cd logflow
npm install
```

Suba a infraestrutura:

```bash
docker-compose up -d
```

Compile o pacote shared:

```bash
npm run build -w @log-platform/shared
```

Inicie o ingestor e o worker em terminais separados:

```bash
npm run dev -w @log-platform/ingestor
npm run dev -w @log-platform/worker
```

### Enviando um log via HTTP

```bash
curl -X POST http://localhost:3000/api/v1/logs \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "INFO",
    "service": {
      "name": "meu-servico",
      "version": "1.0.0",
      "environment": "development"
    },
    "message": "Aplicação iniciada com sucesso"
  }'
```

O ingestor retorna `202 Accepted` com o ID gerado para o log:

```json
{ "id": "8d45ef7a-352c-40ef-9b47-180396b5ca45" }
```

### Enviando um log via gRPC

Utilize qualquer cliente gRPC apontando para `localhost:50051` com o contrato definido em `proto/log.proto`.

## Schema do Log

```typescript
interface LogEntry {
  id: string                          // UUID gerado pelo ingestor
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  service: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    host?: string
  }
  message: string
  timestamp: Date
  traceId?: string                    // Para correlação de requisições entre serviços
  spanId?: string                     // Para rastreamento distribuído
  metadata?: Record<string, unknown>  // Dados adicionais arbitrários
}
```

## Decisões de Arquitetura

**Fastify em vez de Express** — A validação por JSON Schema do Fastify roda em um validador compilado, tornando-o significativamente mais rápido sob alta carga de ingestão. Também oferece suporte nativo a TypeScript e logging estruturado via Pino.

**Fila BullMQ entre o ingestor e o worker** — A fila desacopla a latência de ingestão da latência de escrita. O ingestor envia para o Redis em menos de 1ms e retorna imediatamente. O worker processa os jobs no seu próprio ritmo, com retry automático e backoff exponencial em caso de falha.

**Estratégia de índices no MongoDB** — Três índices são criados na inicialização: um TTL index em `timestamp` para expiração automática de logs após 30 dias, um compound index em `service.name + severity + timestamp` correspondendo ao padrão de consulta principal do dashboard, e um sparse index em `traceId` para buscas de rastreamento distribuído.

**Monorepo com npm workspaces** — Todos os pacotes compartilham um único pacote `@log-platform/shared` contendo interfaces TypeScript e constantes. Isso elimina duplicação de tipos entre os serviços de backend e o dashboard Angular.

**Ingestão por protocolo duplo** — HTTP é o padrão para a maioria das aplicações. gRPC está disponível para serviços de alto throughput que se beneficiam do multiplexing HTTP/2 e da serialização binária Protobuf.

## Variáveis de Ambiente

Cada pacote lê seu próprio arquivo `.env`.

### Ingestor (`packages/ingestor/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `HTTP_PORT` | `3000` | Porta do servidor HTTP |
| `GRPC_PORT` | `50051` | Porta do servidor gRPC |
| `REDIS_HOST` | `localhost` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |

### Worker (`packages/worker/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `REDIS_HOST` | `localhost` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `MONGODB_URI` | `mongodb://admin:admin@localhost:27017/logflow?authSource=admin` | String de conexão do MongoDB |
| `MONGODB_DB` | `logflow` | Nome do banco de dados MongoDB |

## Healthcheck

```bash
curl http://localhost:3000/api/v1/health
```

```json
{ "status": "ok", "timestamp": "2026-04-27T23:00:00.000Z" }
```

## Licença

MIT
