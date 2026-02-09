import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import RedisController from "../Controllers/redis.controller"; // Ajuste o path conforme sua estrutura
import Console, { ConsoleData } from "./Console";

/**
 * ENGINE DE COMUNICAÇÃO ERP UAU
 * * Esta lib centraliza todas as chamadas ao ERP UAU, gerenciando
 * automaticamente o ciclo de vida do Token de Autenticação via Redis.
 * * BENEFÍCIOS:
 * 1. Cache Centralizado: Evita múltiplas autenticações inúteis no ERP.
 * 2. Silent Refresh: Se o token expirar, a lib renova sozinha antes da falha.
 * 3. Cluster Ready: Funciona perfeitamente com múltiplas instâncias do PM2.
 * * USO:
 * import uau from './Lib/UauApi';
 * const { data } = await uau.get('/Obras/Consultar');
 */

const redis = new RedisController();

// Instância base do Axios para o UAU
const uau: AxiosInstance = axios.create({
  baseURL: process.env.UAU_API_DEV!,
  timeout: 30000, // 30 segundos timeout
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-INTEGRATION-Authorization": process.env.UAU_API_TOKEN!
  },
});

/**
 * INTERCEPTOR DE REQUISIÇÃO
 * Antes de cada chamada, verifica a validade do token no Redis.
 */

uau.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    // 1. Tenta resgatar o token cacheado no Redis (Singleton)
    let token = await redis.getUauToken();
    // 2. Se não houver token (Cache Miss), realiza nova autenticação no ERP
    if (token === null) {
      Console({ type: "warn", message: "UAU API: Token não encontrado no cache. Iniciando renovação..." });

      // Chamada direta ao endpoint de autenticação (usando axios puro para evitar loop)
      const response = await axios.post(
        `${process.env.UAU_API_DEV}/Autenticador/AutenticarUsuario`,
        {
          "Login": "icd",
          "Senha": "{246813579aA}",
          "UsuarioUAUSite": "icd"
        },
        {
          headers: {
            "X-INTEGRATION-Authorization": process.env.UAU_API_TOKEN!
          }
        }
      );


      token = response.data
      ConsoleData({ type: "error", data: response })

      // 3. Persiste o novo token no Redis para uso das outras instâncias do Cluster
      await redis.setUauToken(String(token));

      Console({ type: "success", message: "UAU API: Novo token gerado e armazenado com sucesso." });
    }

    // 4. Injeta o token nos headers da requisição original
    if (config.headers) {
      config.headers.Authorization = token;
    }

    return config;

  } catch (error: any) {
    console.log(error)
    Console({
      type: "error",
      message: `UAU API: Falha crítica no fluxo de autenticação - ${error.message}`
    });

    // Interrompe a requisição para não enviar headers inválidos
    return Promise.reject(error);
  }
});

/**
 * INTERCEPTOR DE RESPOSTA
 * Monitora se o ERP rejeitou o token atual.
 */
uau.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Se o UAU retornar 401 (Unauthorized), invalidamos o cache imediatamente
    if (error.response?.status === 401) {
      Console({
        type: "error",
        message: "UAU API: Token invalidado pelo servidor (401). Limpando cache do Redis."
      });

      await redis.deleteUauToken();

      // Opcional: Aqui poderíamos tentar um "retry" automático da requisição,
      // mas por segurança Clean, apenas rejeitamos para que o Service trate.
    }

    return Promise.reject(error);
  }
);

export default uau;
