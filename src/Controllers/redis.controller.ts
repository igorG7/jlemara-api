import { REDIS_EXP, REDIS_KEYS } from "../Lib/RedisKeys";
import Console, { ConsoleData } from "../Lib/Console";
import redis from "../Lib/Redis";

/**
 * REDIS CONTROLLER (Abstraction Layer)
 * * Esta classe atua como uma camada de abstração sobre a biblioteca ioredis.
 * Garante que chaves (Keys) e tempos de expiração (TTL) sigam os padrões definidos
 * na Lib/Redis, evitando "Magic Strings" espalhadas pelo código.
 * * --- EXEMPLOS DE USO ---
 * 1. Instanciar: const redisCtrl = new RedisController();
 * 2. Token UAU:  const token = await redisCtrl.getUauToken();
 * 3. Genérico:   await redisCtrl.post('minha:chave', 'valor', 3600);
 */
export default class RedisController {
  private controller = redis;
  costumerLockKey = "costumer:lock_key"
  /**
   * Recupera um valor do cache através da chave.
   * @param key String definida preferencialmente via REDIS_KEYS.
   * @returns O valor em string ou null caso não exista.
   */
  async get(key: string): Promise<string | null> {
    if (!key) throw new Error('Chave obrigatória para consulta Redis');
    try {
      return await this.controller.get(key);
    } catch (error) {
      return this.handleError("get", error);
    }
  }
  /**
   * Gravação genérica com tempo de expiração.
   * @param key Chave de identificação.
   * @param value Conteúdo a ser armazenado (string).
   * @param expiration Tempo para expirar em SEGUNDOS.
   * @returns Booleano confirmando o sucesso da operação.
   */

  async post(key: string, value: string, expiration: number): Promise<boolean> {
    try {
      const result = await this.controller.set(key, value, "EX", expiration);
      return result === 'OK';
    } catch (error) {
      this.handleError("post", error);
      return false;
    }
  }
  async delete(key: string): Promise<boolean> {
    try {
      await this.controller.del(key);
      return true;
    } catch (error) {
      this.handleError("delete", error);
      return false;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* MÉTODOS ESPECÍFICOS (ERP UAU AUTH)                                         */
  /* -------------------------------------------------------------------------- */

  /**
   * Busca o token de autenticação do ERP UAU persistido.
   */
  async getUauToken(): Promise<string | null | undefined> {
    try {
      return await this.controller.get(REDIS_KEYS.UAU_TOKEN!);
    } catch (error) {
      return this.handleError("getUauToken", error);
    }
  }

  /**
   * Salva ou atualiza o token do ERP UAU com o TTL padrão da arquitetura.
   * @param token Token Bearer retornado pelo ERP.
   */
  async setUauToken(token: string): Promise<string | null | undefined> {
    try {
      return await this.controller.set(
        REDIS_KEYS.UAU_TOKEN,
        token,
        'EX',
        REDIS_EXP.TOKEN_UAU
      );
    } catch (error) {
      return this.handleError("setUauToken", error);
    }
  }

  /**
   * Remove o token UAU do cache (utilizado em casos de 401 Unauthorized).
   */
  async deleteUauToken(): Promise<number | null | undefined> {
    try {
      return await this.controller.del(REDIS_KEYS.UAU_TOKEN);
    } catch (error) {
      return this.handleError("deleteUauToken", error);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* MÉTODOS ESPECÍFICOS (COSTUMER UAU)                                         */
  /* -------------------------------------------------------------------------- */

  /**
   * Tenta criar uma trava atômica para um CPF.
   * Retorna true se conseguiu a trava, false se o CPF já estiver travado.
   */
  async setCustomerLock(cpf: string): Promise<boolean> {
    try {
      const key = REDIS_KEYS.CUSTOMER_LOCK(cpf);
      // 'NX' garante que só grava se não existir.
      const result = await this.controller.set(key, "LOCKED", "EX", REDIS_EXP.DEFAULT_LOCK, "NX");
      return result === 'OK';
    } catch (error) {
      this.handleError("setCustomerLock", error);
      return false;
    }
  }

  async removeCustomerLock(cpf: string): Promise<boolean> {
    return this.delete(REDIS_KEYS.CUSTOMER_LOCK(cpf));
  }

  async verifyCostumerLockKey(key: string) {
    try {
      // validação se ja existe essa key
      const validate = await this.get(key)

      if (validate) {
        return true
      }

      return false
    } catch (error) {
      return this.handleError("verifyCostumerLockKey", error);

    }

  }


  /* -------------------------------------------------------------------------- */
  /* AUXILIARES PRIVADOS                                                        */
  /* -------------------------------------------------------------------------- */

  /**
   * Padronização de logs de erro para operações Redis.
   */
  private handleError(method: string, error: any): null {
    const message = error instanceof Error ? error.message : "Erro desconhecido no Redis";

    Console({
      type: "error",
      message: `RedisController.${method} | ${message}`
    });

    ConsoleData({ type: "error", data: error });
    return null;
  }


}
