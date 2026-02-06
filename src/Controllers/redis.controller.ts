import Console, { ConsoleData } from "../Lib/Console";
import redis from "../Lib/Redis";

export default class RedisController {
  controller;

  constructor() {
    this.controller = redis
  }
  async get(key: string) {
    if (!key) {
      throw new Error('A chave é obrigatoria para a consulta')
    }
    Console({ type: "log", message: `Buscando informação no banco redis | ${key}` })
    try {
      const result = await this.controller.get(key)
      Console({ type: "success", message: `${key} encontrada com sucesso` })

      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verifique o catch de getRedis() | Algo de errado aconteceu"
      Console({ type: "error", message })
      ConsoleData({ type: "error", data: error })
    }
  }

  async post(key: string, value: string, expiration: number) {
    Console({ type: "log", message: `Salvando informação no banco redis | ${key}:${value}` })
    try {
      const result = await this.controller.set(key, value, "EX", expiration)
      if (result === 'OK') {
        Console({ type: "success", message: `${key} salva com sucesso com tempo de expiração de ${expiration / 1000}s` })
        return true
      } else {
        Console({ type: "error", message: `${key} não foi salva com sucesso` })
        ConsoleData({ type: "error", data: result })
        throw new Error("Não foi possivel salvar a informação no banco redis")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verifique o catch de saveRedis() | Algo de errado aconteceu"
      Console({ type: "error", message })
      ConsoleData({ type: "error", data: error })
    }
  }
}
