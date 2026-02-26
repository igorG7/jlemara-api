import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import RedisController from "../Controllers/redis.controller";
import Console from "./Console";

/**
 * ENGINE DE COMUNICAÇÃO ERP UAU
 * 
 * Esta lib centraliza todas as chamadas ao ERP UAU, gerenciando
 * automaticamente o ciclo de vida do Token de Autenticação via Redis.
 * 
 * BENEFÍCIOS:
 * 1. Cache Centralizado: Evita múltiplas autenticações inúteis no ERP.
 * 2. Silent Refresh: Se o token expirar, a lib renova sozinha antes da falha.
 * 3. Auto Retry: Se o ERP rejeitar o token (401), limpa o cache e retenta 1x.
 * 4. Erros Normalizados: Todo erro sai como UauApiError, sem vazamento de dados.
 * 5. Cluster Ready: Funciona perfeitamente com múltiplas instâncias do PM2.
 * 
 */

// ─────────────────────────────────────────────────
// ERRO CUSTOMIZADO — impede vazamento de dados sensíveis
// ─────────────────────────────────────────────────


export class UauApiError extends Error {
  public readonly statusCode: number | null;
  public readonly endpoint: string;
  public readonly uauMessage: string | null;

  constructor(params: {
    message: string;
    statusCode?: number | null;
    endpoint?: string;
    uauMessage?: string | null;
  }) {
    super(params.message);
    this.name = "UauApiError";
    this.statusCode = params.statusCode ?? null;
    this.endpoint = params.endpoint ?? "unknown";
    this.uauMessage = params.uauMessage ?? null;
  }
}

// ─────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────

const MAX_RETRY_ATTEMPTS = 1; // Apenas 1 retry em caso de 401

const redis = new RedisController();

// ─────────────────────────────────────────────────
// INSTÂNCIA BASE AXIOS
// ─────────────────────────────────────────────────

const uau: AxiosInstance = axios.create({
  baseURL: process.env.UAU_API_DEV!,
  timeout: 45000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-INTEGRATION-Authorization": process.env.UAU_API_TOKEN!
  },
});

// ─────────────────────────────────────────────────
// INTERCEPTOR DE REQUISIÇÃO
// Injeta o token válido antes de cada chamada.
// Se não houver token no cache, autentica silenciosamente.
// ─────────────────────────────────────────────────

uau.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    // 1. Tenta resgatar o token cacheado no Redis
    let token = await redis.getUauToken();

    // 2. Cache Miss — realiza nova autenticação no ERP
    if (!token) {
      Console({ type: "warn", message: "UAU API: Token not found in cache. Starting renewal..." });

      token = await authenticateUau();
    }

    // 3. Injeta o token no header da requisição original
    if (config.headers) {
      config.headers.Authorization = token;
    }

    return config;

  } catch (error) {
    // Falha na autenticação — interrompe a requisição para não enviar headers inválidos
    const message = error instanceof Error ? error.message : "Unknown error";

    Console({
      type: "error",
      message: `UAU API: Critical authentication failure — ${message}`
    });

    return Promise.reject(
      new UauApiError({
        message: `Authentication failure with UAU ERP: ${message}`,
        endpoint: "Autenticador/AutenticarUsuario"
      })
    );
  }
});

// ─────────────────────────────────────────────────
// INTERCEPTOR DE RESPOSTA
// Normaliza erros e gerencia retry automático no 401.
// ─────────────────────────────────────────────────

uau.interceptors.response.use(

  // ✅ Sucesso — retorna direto o body (response.data)
  (response) => response.data,

  // ❌ Erro — normaliza e trata por tipo
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    const endpoint = extractEndpoint(originalRequest?.url);

    // ── 1. TIMEOUT ──────────────────────────────────
    if (error.code === "ECONNABORTED") {
      Console({
        type: "error",
        message: `UAU API: Timeout — API did not respond within 45s [${endpoint}]`
      });

      return Promise.reject(
        new UauApiError({
          message: `Timeout: UAU API did not respond in time`,
          endpoint,
        })
      );
    }

    // ── 2. ERRO DE REDE / DNS / CONEXÃO RECUSADA ────
    if (!error.response) {
      Console({
        type: "error",
        message: `UAU API: Network error — no response from server [${endpoint}]`
      });

      return Promise.reject(
        new UauApiError({
          message: `Network error: could not connect to UAU ERP`,
          endpoint,
        })
      );
    }

    // ── 3. 401 UNAUTHORIZED — RETRY AUTOMÁTICO ──────
    const status = error.response.status;
    const retryCount = originalRequest?._retryCount ?? 0;

    if (status === 401 && retryCount < MAX_RETRY_ATTEMPTS && originalRequest) {

      Console({
        type: "warn",
        message: `UAU API: Token rejected (401). Clearing cache and retrying... [${endpoint}]`
      });

      // Invalida o token atual no Redis
      await redis.deleteUauToken();

      // Marca o retry para evitar loop infinito
      originalRequest._retryCount = retryCount + 1;

      // O request interceptor vai gerar um novo token automaticamente
      return uau(originalRequest);
    }

    // ── 4. DEMAIS ERROS HTTP (400, 403, 404, 500...) ─
    const uauMessage = extractUauMessage(error.response.data);

    Console({
      type: "error",
      message: `UAU API: Error ${status} on [${endpoint}] — ${uauMessage ?? "No ERP message"}`
    });

    return Promise.reject(
      new UauApiError({
        message: uauMessage ?? `Error ${status} communicating with UAU ERP`,
        statusCode: status,
        endpoint,
        uauMessage,
      })
    );
  }
);

// ─────────────────────────────────────────────────
// FUNÇÕES AUXILIARES (privadas ao módulo)
// ─────────────────────────────────────────────────

/**
 * Realiza autenticação direta no ERP UAU.
 * Usa axios puro (sem a instância `uau`) para evitar loop nos interceptors.
 * @returns Token string válido
 * @throws Error se a autenticação falhar
 */
async function authenticateUau(): Promise<string> {
  const response = await axios.post(
    `${process.env.UAU_API_DEV}/Autenticador/AutenticarUsuario`,
    {
      Login: process.env.UAU_USER!,
      Senha: process.env.UAU_PASSWORD!,
      UsuarioUAUSite: process.env.UAU_USER!,
    },
    {
      headers: {
        "X-INTEGRATION-Authorization": process.env.UAU_API_TOKEN!
      },
      timeout: 15000, // Timeout mais curto para autenticação
    }
  );

  const token = response.data;

  // Validação: garante que o token é uma string não-vazia
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw new Error("Token returned by UAU ERP is invalid or empty");
  }

  // Persiste no Redis para uso do cluster
  await redis.setUauToken(token);

  Console({ type: "success", message: "UAU API: New token generated and stored successfully." });

  return token;
}

/**
 * Extrai mensagem de erro do body da resposta do UAU.
 * A API UAU pode retornar a mensagem em diferentes formatos.
 */
function extractUauMessage(data: any): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  return data?.message ?? data?.Message ?? data?.erro ?? data?.Erro ?? null;
}

/**
 * Extrai o endpoint limpo da URL (sem baseURL e sem query params).
 * Evita vazar a URL completa com possíveis tokens na query string.
 */
function extractEndpoint(url: string | undefined): string {
  if (!url) return "unknown";
  // Remove baseURL se presente e query params
  return url.replace(process.env.UAU_API_DEV ?? "", "").split("?")[0] || "unknown";
}

export default uau;
