/**
 * NAMESPACING E CONFIGURAÇÕES REDIS
 * Centraliza todas as chaves para evitar "Magic Strings" no projeto.
 */

export const REDIS_KEYS = {
  // Autenticação UAU
  UAU_TOKEN: "auth:uau:token",

  // Locks de Processo (Prevenção de duplicidade)
  CUSTOMER_LOCK: (cpf: string) => `lock:customer:record:${cpf}`,

  // Filas (Queues) para Workers
  QUEUE_SYNC_CUSTOMERS: "queue:uau:customers:sync",
} as const;

export const REDIS_EXP = {
  TOKEN_UAU: 13800, // 3h 50min
  DEFAULT_LOCK: 60, // 1 minuto
} as const;
