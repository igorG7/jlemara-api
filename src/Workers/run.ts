//src\Workers\run.ts
import cron from 'node-cron';
import CustomerErpWorker from './Erp/customer.erp.worker';
import Console, { ConsoleData } from '../Lib/Console';
import ConnectionDB from '../Configs/ConnectionDB';
import DevelopmentErpWorker from './Erp/obra.erp.worker';
import UnitErpWorker from './Erp/unidade.erp.worker';


const customerErpWorker = new CustomerErpWorker()
const developmentErpWorker = new DevelopmentErpWorker()
const unitsErpWorker = new UnitErpWorker()
ConnectionDB.connect()


// CUSTOMER  → todos os dias às 05:00 AM
cron.schedule('0 5 * * *', async () => {
  Console({ type: "log", message: "⏰ Cron disparado: Iniciando ETL de Customer (5:00 AM)" })
  try {
    await customerErpWorker.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker ERP Customer"
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}, {
  name: "EXECUÇÃO ETL ERP CUSTOMER WORKER",
  timezone: "America/Sao_Paulo"
})


// OBRA → a cada hora (05h–23h), segunda a sábado
cron.schedule('0 5-23 * * 1-6', async () => {
  Console({ type: "log", message: "⏰ Cron disparado: Iniciando ETL de Obras" })
  try {
    await developmentErpWorker.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker ERP Development"
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}, {
  name: "EXECUÇÃO ETL ERP Development WORKER",
  timezone: "America/Sao_Paulo"
})


// UNIDADE → a cada hora (05h–23h), segunda a sábado
cron.schedule('0 5-23 * * 1-6', async () => {
  Console({ type: "log", message: "⏰ Cron disparado: Iniciando ETL de Units" })
  try {
    await unitsErpWorker.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker ERP Units"
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}, {
  name: "EXECUÇÃO ETL ERP UNITS WORKER",
  timezone: "America/Sao_Paulo"
})


async function runFirstInitial() {
  console.time("⏰ ETL Inicial ⏰")
  Console({ type: "log", message: "⏰ ETL Inicial: Iniciando ETL GERAL ⏰" })
  try {
    await customerErpWorker.start()
    await developmentErpWorker.start()
    await unitsErpWorker.start()
    console.timeEnd("⏰ ETL Inicial ⏰")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker ERP Customer"
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}


(async () => process.env.RUN_INITIAL === 'true' && await runFirstInitial())()
