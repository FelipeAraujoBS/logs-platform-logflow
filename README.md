# logflow

Plataforma centralizada de gerenciamento de logs e telemetria construída para cargas de trabalho em produção. O logflow recebe logs de qualquer aplicação via HTTP ou gRPC, processa de forma assíncrona através de uma fila Redis e persiste no MongoDB — expondo uma query API e um dashboard Angular em tempo real para filtragem, monitoramento e análise.

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
| Dashboard | Angular, Chart.js |
| Infraestrutura | Docker, Docker Compose, Nginx |

## Estrutura do Projeto

```
logflow/
  packages/
    shared/       # Tipos e interfaces TypeScript compartilhados
    ingestor/     # Servidor de ingestão HTTP e gRPC (Fastify)
    worker/       # Consumidor BullMQ e escritor MongoDB
    query-api/    # Servidor de consulta REST e WebSocket
    dashboard/    # Dashboard Angular servido por Nginx
  proto/
    log.proto     # Definição do contrato gRPC
  scripts/
    stress-test.ps1  # Script para geração de volume de logs
  docker-compose.yml
```

## Como Rodar

### Pré-requisitos

- Docker e Docker Compose

### Subindo toda a plataforma

Clone o repositório e suba todos os serviços com um único comando:

```bash
git clone https://github.com/FelipeAraujoBS/logflow
cd logflow
docker-compose up --build
```

O Docker Compose vai subir automaticamente:

- **Redis** na porta `6379`
- **MongoDB** na porta `27017`
- **Ingestor** na porta `3000` (HTTP) e `50051` (gRPC)
- **Worker** consumindo a fila em background
- **Query API** na porta `3001`
- **Dashboard** em `http://localhost`

### Desenvolvimento local

Para rodar com hot-reload, instale as dependências e suba os serviços de infraestrutura:

```bash
npm install
docker-compose up -d redis mongodb
```

Compile o pacote shared e inicie todos os serviços:

```bash
npm run build -w @log-platform/shared
npm run dev
```

O script `npm run dev` usa `concurrently` para subir ingestor, worker, query-api e dashboard Angular em paralelo com outputs coloridos por serviço.

## Testando a Plataforma

O logflow é um sistema de ingestão real — ele processa logs de aplicações externas via HTTP e gRPC. Abaixo estão as formas de testá-lo com dados reais.

### Enviando um log via HTTP

```powershell
Invoke-WebRequest -Method POST `
  -Uri "http://localhost:3000/api/v1/logs" `
  -ContentType "application/json" `
  -Body '{
    "severity": "ERROR",
    "service": {
      "name": "payment-service",
      "version": "2.1.0",
      "environment": "production"
    },
    "message": "Falha ao processar pagamento"
  }'
```

O ingestor retorna `202 Accepted` com o ID gerado para o log:

```json
{ "id": "8d45ef7a-352c-40ef-9b47-180396b5ca45" }
```

### Stress test — gerando volume de logs

Para popular o dashboard com dados variados de múltiplos serviços e severidades, rode o script de stress test:

```powershell
.\scripts\stress-test.ps1
```

O script envia 100 logs com serviços, severidades e mensagens aleatórias em intervalos de 200ms — permitindo observar o pipeline completo em funcionamento: ingestão → fila → persistência → dashboard em tempo real.

### Simulando uma aplicação integrada

Para simular uma aplicação real enviando logs continuamente:

```bash
npx ts-node scripts/simulate-app.ts
```

O script envia um log a cada 500ms indefinidamente, permitindo observar a seção de tempo real do dashboard atualizando automaticamente via WebSocket.

### Consultando logs via API

```bash
# Todos os logs
curl http://localhost:3001/api/v1/logs

# Filtrar por severidade
curl http://localhost:3001/api/v1/logs?severity=ERROR

# Filtrar por serviço
curl http://localhost:3001/api/v1/logs?serviceName=payment-service

# Filtrar por período
curl http://localhost:3001/api/v1/logs?startDate=2026-01-01T00:00:00Z

# Paginação
curl http://localhost:3001/api/v1/logs?page=2&pageSize=25
```

### Enviando um log via gRPC

Utilize qualquer cliente gRPC apontando para `localhost:50051` com o contrato definido em `proto/log.proto`. Ferramentas como [grpcurl](https://github.com/fullstorydev/grpcurl) ou [Insomnia](https://insomnia.rest) suportam gRPC nativamente.

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

**Fila BullMQ entre o ingestor e o worker** — A fila desacopla a latência de ingestão da latência de escrita. O ingestor envia para o Redis em menos de 1ms e retorna `202 Accepted` imediatamente. O worker processa os jobs no seu próprio ritmo, com retry automático e backoff exponencial em caso de falha — garantindo zero perda de logs em situações de sobrecarga.

**Estratégia de índices no MongoDB** — Três índices são criados na inicialização: um TTL index em `timestamp` para expiração automática de logs após 30 dias, um compound index em `service.name + severity + timestamp` correspondendo ao padrão de consulta principal do dashboard, e um sparse index em `traceId` para buscas de rastreamento distribuído.

**Monorepo com npm workspaces** — Todos os pacotes compartilham um único pacote `@log-platform/shared` contendo interfaces TypeScript e constantes. Isso elimina duplicação de tipos entre os serviços de backend e o dashboard Angular, garantindo consistência de contrato em todo o sistema.

**Ingestão por protocolo duplo** — HTTP é o padrão para a maioria das aplicações. gRPC está disponível para serviços de alto throughput que se beneficiam do multiplexing HTTP/2 e da serialização binária Protobuf, com o contrato definido em `proto/log.proto`.

**WebSocket para tempo real** — O dashboard mantém uma conexão WebSocket persistente com a query-api. Novos logs aparecem na seção de tempo real sem necessidade de refresh, com animação de entrada e buffer dos últimos 10 eventos.

**Nginx como servidor de produção** — O dashboard Angular é compilado em arquivos estáticos e servido pelo Nginx, que também atua como proxy reverso para a query-api — eliminando problemas de CORS em produção.

## Variáveis de Ambiente

Cada serviço lê suas próprias variáveis. No Docker Compose, todas são configuradas automaticamente. Para desenvolvimento local, cada pacote tem seu próprio `.env`.

### Ingestor

| Variável | Padrão | Descrição |
|---|---|---|
| `HTTP_PORT` | `3000` | Porta do servidor HTTP |
| `GRPC_PORT` | `50051` | Porta do servidor gRPC |
| `REDIS_HOST` | `localhost` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |

### Worker

| Variável | Padrão | Descrição |
|---|---|---|
| `REDIS_HOST` | `localhost` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `MONGODB_URI` | `mongodb://admin:admin@localhost:27017/logflow?authSource=admin` | String de conexão |
| `MONGODB_DB` | `logflow` | Nome do banco de dados |

### Query API

| Variável | Padrão | Descrição |
|---|---|---|
| `HTTP_PORT` | `3001` | Porta do servidor |
| `MONGODB_URI` | `mongodb://admin:admin@localhost:27017/logflow?authSource=admin` | String de conexão |
| `MONGODB_DB` | `logflow` | Nome do banco de dados |

## Healthcheck

```bash
curl http://localhost:3000/api/v1/health  # ingestor
curl http://localhost:3001/api/v1/health  # query-api
```

```json
{ "status": "ok", "timestamp": "2026-04-30T00:00:00.000Z" }
```

## Licença

MIT
