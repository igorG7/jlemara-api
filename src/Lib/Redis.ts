import Redis from "ioredis";
import Console from "./Console";
import { configDotenv } from "dotenv";

configDotenv();

/**
 * Configuração da Lib Central de Redis (Singleton)
 * * EXEMPOS DE USO:
 * 1. import redis, { REDIS_KEYS, REDIS_EXP } from "./Lib/Redis";
 * 2. await redis.set(REDIS_KEYS.UAU_TOKEN, 'val', 'EX', REDIS_EXP.TOKEN_UAU);
 */

const REDIS_PATH = process.env.REDIS_URL!;

if (!REDIS_PATH) {
  Console({
    type: "error",
    message: "CRÍTICO: Variável REDIS_URL não encontrada no arquivo .env"
  });
  process.exit(1);
}

// A instância do Redis já extrai usuário/senha do REDIS_PATH automaticamente
const redis = new Redis(REDIS_PATH, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
});

/*
 * --- LISTENERS DE MONITORAMENTO ---
 */

redis.on("connect", () => {
  Console({ type: "success", message: "Redis: Iniciando tentativa de conexão..." });
});

redis.on("ready", () => {
  Console({ type: "success", message: "Redis: Conexão estabelecida e pronta." });
});

redis.on("error", (error) => {
  const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
  Console({ type: "error", message: `Redis: Falha crítica - ${errorMessage}` });
});

redis.on("reconnecting", () => {
  Console({ type: "warn", message: "Redis: Tentando reconectar automaticamente..." });
});

export { redis };
export default redis;
