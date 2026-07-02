# Logflow

Plataforma centralizada de ingestão, armazenamento, consulta e monitoramento de logs e telemetria. Recebe logs de qualquer aplicação via **HTTP** ou **gRPC**, processa de forma assíncrona via **BullMQ/Redis**, persiste em **MongoDB** e expõe **API REST**, **WebSocket** em tempo real, **dashboard Angular** e **métricas Prometheus**.

## Arquitetura

```
[Aplicações] ── HTTP / gRPC ──▶ [Ingestor :3000] ──▶ [BullMQ / Redis] ──▶ [Worker] ──▶ [MongoDB]
                                   │                       │                                │
                                   │  GET /metrics         │  GET /metrics                  │  GET /metrics
                                   ▼                       ▼                                ▼
                              Prometheus ◀────────── Prometheus ◀──────────────────── Prometheus
                                                                                            │
                                                                              ┌──────────────┴──────────────┐
                                                                              ▼                             ▼
                                                                      [Query API :3001]           [Dashboard :80]
                                                                      GET /api/v1/logs           (Angular + Nginx)
                                                                      GET /api/v1/logs/stream     proxy /api → query-api
                                                                      GET /metrics
```

### Componentes

| Serviço | Papel | Stack |
|---|---|---|
| **Ingestor** | Recebe logs via HTTP POST e gRPC, valida, normaliza e enfileira | Node.js + Fastify + gRPC |
| **Redis** | Fila BullMQ desacoplando ingestão da persistência | Redis 7 |
| **Worker** | Consome a fila, persiste logs no MongoDB, cria índices | Node.js + BullMQ |
| **MongoDB** | Armazenamento com TTL de 30 dias e índices otimizados para consulta | MongoDB 7 |
| **Query API** | API REST com paginação/filtros + WebSocket para atualizações em tempo real | Node.js + Fastify |
| **Dashboard** | Interface Angular para busca, filtro e visualização de logs | Angular + Nginx |
| **Métricas** | Prometheus endpoint `/metrics` em cada serviço | prom-client + fastify-metrics |

## Como Rodar

### Produção (Docker Compose)

```bash
# 1. Clone
git clone https://github.com/FelipeAraujoBS/logflow
cd logflow

# 2. Configure a chave de API (obrigatória)
export API_KEY=uma-chave-segura-aqui

# 3. Suba tudo
docker-compose up --build
```

Isso sobe: Redis (6379), MongoDB (27017), Ingestor (3100 + 50052), Worker, Query API (3101), Dashboard (8080), Worker Metrics (9090).

### Desenvolvimento

```bash
npm install
docker-compose up -d redis mongodb
npm run build -w @log-platform/shared
npm run dev              # ingestor + worker + query-api + dashboard em paralelo
```

## Autenticação

Todos os endpoints (exceto `/health` e `/metrics`) exigem o header:

```
Authorization: Bearer <API_KEY>
```

A `API_KEY` é obrigatória e compartilhada entre ingestor e query-api. Configure via variável de ambiente.

## API de Ingestão

### HTTP POST `/api/v1/logs`

**Request:**
```json
{
  "severity": "ERROR",
  "service": {
    "name": "meu-servico",
    "version": "1.0.0",
    "environment": "production",
    "host": "host-01"
  },
  "message": "Falha ao processar requisição",
  "timestamp": "2026-07-01T12:00:00Z",
  "traceId": "abc-123",
  "spanId": "def-456",
  "metadata": { "userId": 42, "orderId": "ORD-001" }
}
```

**Response** `202 Accepted`:
```json
{ "id": "uuid-v4-gerado" }
```

**Validação:**
- `severity`: obrigatório, enum `DEBUG | INFO | WARN | ERROR | FATAL`
- `service.name`, `service.version`, `service.environment`: obrigatórios, minLength 1
- `service.environment`: enum `development | staging | production`
- `message`: obrigatório, minLength 1
- `timestamp`: opcional, formato ISO 8601 (default: now)
- `traceId`, `spanId`, `service.host`, `metadata`: opcionais

### gRPC `IngestLog`

Proto: `packages/ingestor/proto/log.proto`

Endpoint: `localhost:50052`
Service: `log.LogService`
Method: `IngestLog`

```protobuf
message LogRequest {
  string severity            = 1;
  string service_name        = 2;
  string service_version     = 3;
  string service_environment = 4;
  string service_host        = 5;
  string message             = 6;
  int64  timestamp_ms        = 7;
  string trace_id            = 8;
  string span_id             = 9;
  string metadata_json       = 10;
}
```

Metadata obrigatória: `authorization: Bearer <API_KEY>`

## API de Consulta

### `GET /api/v1/logs`

**Query params:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `severity` | string | Filtrar por severidade |
| `serviceName` | string | Filtrar por nome do serviço |
| `traceId` | string | Filtrar por trace ID |
| `startDate` | ISO 8601 | Início do período |
| `endDate` | ISO 8601 | Fim do período |
| `page` | number | Página (default: 1, mínimo: 1) |
| `pageSize` | number | Itens por página (default: 50, max: 100) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "severity": "ERROR",
      "service": { "name": "...", "version": "...", "environment": "production", "host": "..." },
      "message": "...",
      "timestamp": "2026-07-01T12:00:00.000Z",
      "traceId": "...",
      "spanId": "...",
      "metadata": {}
    }
  ],
  "total": 1500,
  "page": 1,
  "pageSize": 50,
  "totalPages": 30
}
```

### WebSocket `/api/v1/logs/stream`

Conecte via WebSocket com `ws://host:3101/api/v1/logs/stream` (autenticação via header). Recebe novos logs em tempo real com polling de 2s e buffer dos últimos 10 eventos.

### Health Check

```
GET /api/v1/health
```

Ingestor verifica Redis; Query API verifica MongoDB. Retorna `200` se tudo ok, `503` se degradado.

## Métricas Prometheus

Cada serviço expõe `GET /metrics`:

| Serviço | Porta | Métricas |
|---|---|---|
| **Ingestor** | 3100 | `http_request_duration_seconds` (por rota, método, status), `logflow_logs_received_total` (labels: protocol=`http`/`grpc`), + default (CPU, memória, event loop) |
| **Worker** | 9090 | `logflow_jobs_processed_total`, `logflow_jobs_failed_total`, `logflow_job_processing_duration_seconds` (histograma: 0.01s a 5s), + default |
| **Query API** | 3101 | `http_request_duration_seconds` (por rota, método, status), + default |

Para coletar, aponte seu Prometheus para os 3 endpoints:

```yaml
scrape_configs:
  - job_name: 'logflow-ingestor'
    static_configs:
      - targets: ['logflow-ingestor:3000']
  - job_name: 'logflow-worker'
    static_configs:
      - targets: ['logflow-worker:9090']
  - job_name: 'logflow-query-api'
    static_configs:
      - targets: ['logflow-query-api:3001']
```

## Schema do Log

```typescript
interface LogEntry {
  id: string                              // UUID v4
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  service: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    host?: string
  }
  message: string
  timestamp: Date
  traceId?: string                        // correlação entre serviços
  spanId?: string                         // distributed tracing
  metadata?: Record<string, unknown>      // dados arbitrários
}
```

## Armazenamento

- **TTL**: 30 dias (índice `expireAfterSeconds` em `timestamp`)
- **Índices**:
  - `{ timestamp: 1 }` — TTL + ordenação por tempo
  - `{ "service.name": 1, severity: 1, timestamp: -1 }` — padrão de consulta do dashboard
  - `{ traceId: 1 }` — sparse, para rastreamento distribuído
- **Retry de jobs**: 3 tentativas com backoff exponencial (1s inicial)

## Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Serviço |
|---|---|---|---|
| `API_KEY` | Sim | — | Ingestor, Query API |
| `HTTP_PORT` | Não | `3000` | Ingestor |
| `GRPC_PORT` | Não | `50051` | Ingestor |
| `REDIS_HOST` | Não | `localhost` | Ingestor, Worker |
| `REDIS_PORT` | Não | `6379` | Ingestor, Worker |
| `MONGODB_URI` | Não | `mongodb://admin:admin@localhost:27017/logflow?authSource=admin` | Worker, Query API |
| `MONGODB_DB` | Não | `logflow` | Worker, Query API |
| `WORKER_CONCURRENCY` | Não | `10` | Worker |
| `WORKER_METRICS_PORT` | Não | `9090` | Worker |
| `HTTP_PORT` | Não | `3001` | Query API |
| `CORS_ORIGIN` | Não | `http://localhost,http://localhost:4200` | Query API |

## Guia de Integração

Para conectar uma aplicação ao Logflow, existem 3 abordagens:

### 1. Aplicações Node.js com Pino (recomendado)

Crie um **Pino transport** que redireciona logs para o ingestor:

```typescript
// logflow-transport.ts
import { Transform } from "stream";

const INGESTOR_URL = process.env.LOGFLOW_URL ?? "http://localhost:3100";
const API_KEY = process.env.LOGFLOW_API_KEY;

async function send(entry: Record<string, unknown>) {
  try {
    await fetch(`${INGESTOR_URL}/api/v1/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        severity: (entry.level as number) >= 50 ? "FATAL"
                 : (entry.level as number) >= 40 ? "ERROR"
                 : (entry.level as number) >= 30 ? "WARN"
                 : (entry.level as number) >= 20 ? "INFO" : "DEBUG",
        service: {
          name: entry.name ?? "unknown",
          version: process.env.APP_VERSION ?? "1.0.0",
          environment: process.env.NODE_ENV ?? "development",
        },
        message: entry.msg as string,
        timestamp: entry.time as string,
        metadata: { ...entry, msg: undefined, level: undefined, time: undefined, name: undefined },
      }),
    });
  } catch {}
}

export default function () {
  return new Transform({
    objectMode: true,
    transform(chunk, _enc, callback) {
      send(chunk);
      callback(null, chunk);
    },
  });
}
```

Uso na aplicação (apenas adiciona o transport, sem alterar o logger existente):

```typescript
import pino from "pino";

const logger = pino({
  transport: {
    target: "./logflow-transport.ts",
  },
});
```

### 2. Aplicações Python (logging nativo)

Crie um **logging.Handler** customizado:

```python
# logflow_handler.py
import json
import logging
import os
from urllib.request import Request, urlopen

INGESTOR_URL = os.getenv("LOGFLOW_URL", "http://localhost:3100")
API_KEY = os.getenv("LOGFLOW_API_KEY")

LEVEL_MAP = {
    50: "FATAL", 40: "ERROR", 30: "WARN",
    20: "INFO", 10: "DEBUG", 0: "DEBUG",
}

class LogflowHandler(logging.Handler):
    def emit(self, record):
        try:
            body = json.dumps({
                "severity": LEVEL_MAP.get(record.levelno, "INFO"),
                "service": {
                    "name": record.name,
                    "version": os.getenv("APP_VERSION", "1.0.0"),
                    "environment": os.getenv("ENVIRONMENT", "development"),
                },
                "message": self.format(record),
                "metadata": getattr(record, "extra", {}),
            }).encode()
            req = Request(
                f"{INGESTOR_URL}/api/v1/logs",
                data=body,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {API_KEY}",
                },
                method="POST",
            )
            urlopen(req, timeout=2)
        except Exception:
            pass  # never block the app
```

Uso:

```python
import logging
from logflow_handler import LogflowHandler

logger = logging.getLogger("meu-servico")
logger.addHandler(LogflowHandler())
```

### 3. Qualquer aplicação (HTTP direto)

Faça POST para `http://<logflow>:3100/api/v1/logs` com header `Authorization: Bearer <API_KEY>` e body JSON conforme schema acima.

### Roteiro de integração para "Uma Busca de Gelo e Fogo"

Dado o stack (Backend Node.js + Fastify, RAG Python + FastAPI, Frontend Next.js):

1. **Backend (Fastify + Pino)**: Adicionar o Pino transport `logflow-transport.ts` — 0 alterações no código existente, apenas referenciar na criação do logger
2. **RAG (Python + FastAPI)**: Adicionar o `LogflowHandler` ao logger raiz — 0 alterações nas rotas ou handlers existentes
3. **Frontend (Next.js server-side)**: Criar função utilitária que envia logs de server actions e API routes para o ingestor — 0 alterações nos componentes React

## Segurança

- **Autenticação**: Bearer token (`API_KEY`) em todos os endpoints exceto health e metrics
- **Helmet**: Headers de segurança HTTP habilitados
- **Rate limiting**: 100 requisições/minuto por IP
- **NoSQL injection**: Sanitização de `$` e `.` em parâmetros de consulta
- **Contêineres**: Dockerfiles com usuário não-root
- **gRPC**: Autenticação via metadata `authorization`

## Dashboard

Acesse `http://localhost` após subir o stack. O Nginx serve o Angular e faz proxy de `/api` para a query-api, eliminando CORS em produção.

Funcionalidades:
- Filtro por severidade, serviço e período
- Gráficos de volume por severidade (Chart.js)
- Atualização em tempo real via WebSocket
- Paginação e busca textual

## Limitações Conhecidas

- **Sem autenticação por serviço**: a `API_KEY` é compartilhada entre todos os serviços que enviam logs
- **Sem cifra TLS**: gRPC usa `createInsecure()`; para produção atrás de um proxy reverso com TLS
- **Sem replicação**: Redis e MongoDB são single-instance; para HA, configure Redis Sentinel/Cluster e MongoDB Replica Set
- **Sem testes automatizados**: o backend não possui testes unitários ou de integração

## Licença

MIT
