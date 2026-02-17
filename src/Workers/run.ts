//src\Workers\run.ts
import cron from 'node-cron';
import CustomerUauWorker from './Uau/customer.uau.worker';
import ObraUauWorker from './Uau/obra.uau.worker';
import UnidadeUauWorker from './Uau/unidade.uau.worker';
import Console, { ConsoleData } from '../Lib/Console';
import ConnectionDB from '../Configs/ConnectionDB';


const customerUauWorker = new CustomerUauWorker()
const obraUauWorker = new ObraUauWorker()
const unidadeUauWorker = new UnidadeUauWorker()
ConnectionDB.connect()


// CUSTOMER  → todos os dias às 05:00 AM
cron.schedule('0 5 * * *', async () => {
  Console({ type: "log", message: "⏰ Cron disparado: Iniciando ETL de Clientes (5:00 AM)" })
  try {
    await customerUauWorker.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker uau customer"
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}, {
  name: "EXECUÇÃO ETL UAU CUSTOMER WORKER",
  timezone: "America/Sao_Paulo"
})


// OBRA → a cada hora (05h–23h), segunda a sábado
cron.schedule('0 5-23 * * 1-6', async () => {
  Console({ type: "log", message: "⏰ Cron disparado: Iniciando ETL de Obras" })
  try {
    await obraUauWorker.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker uau obra"
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}, {
  name: "EXECUÇÃO ETL UAU OBRA WORKER",
  timezone: "America/Sao_Paulo"
})


// UNIDADE → a cada hora (05h–23h), segunda a sábado
cron.schedule('0 5-23 * * 1-6', async () => {
  Console({ type: "log", message: "⏰ Cron disparado: Iniciando ETL de Unidades" })
  try {
    await unidadeUauWorker.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker uau unidade"
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}, {
  name: "EXECUÇÃO ETL UAU UNIDADE WORKER",
  timezone: "America/Sao_Paulo"
})


// Para testes manuais: substitua o worker desejado e rode `npm run etl`
async function test() {
  await customerUauWorker.start()
}
