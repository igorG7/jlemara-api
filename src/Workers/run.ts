//src\Workers\run.ts
import cron from 'node-cron';
import CustomerUauWorker from './Uau/customer.uau.worker';
import Console, { ConsoleData } from '../Lib/Console';
import ConnectionDB from '../Configs/ConnectionDB';


const customerUauWorker = new CustomerUauWorker()
ConnectionDB.connect()


/*
* 01. AGENDAMENTO CUSTOMER - REALIZA A BUSCA DE TODOS OS CLIENTES QUE POSSUEM VENDA NO ERP *

! 02. CASO NECESSARIO, FAÇA A CHAMADA DO test() PARA VALIDAR A EXECUÇÃO !

? 03. PARA FAZER A EXECUÇÃO, RODE NPM RUN ETL ?

* ESTÁ DEFINIDO PARA RODAR TODOS OS DIAS AS 05:00 AM *

*/


cron.schedule('0 5 * * *', async () => {

  Console({ type: "log", message: "⏰ Cron disparado: Iniciando ETL de Clientes (5:00 AM)" })
  try {
    await customerUauWorker.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Problemas na inicialização ou processamento worker uau customer "
    Console({ type: "error", message });
    ConsoleData({ type: "error", data: error })
  }
}, {
  name: "EXECUÇÃO ETL UAU WORKER",
  timezone: "America/Sao_Paulo"
})



async function test() {
  await customerUauWorker.start()
  return
}
