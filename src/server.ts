import { configDotenv } from "dotenv";

import app from "./app";
import UauCustomerController from "./Controllers/uau/uau.costumer.controller";
import uau from "./Lib/Uau";

configDotenv();

const PORT = process.env.PORT;

app.listen(PORT, async () => {

  console.log("Servidor iniciado.");
  console.log(`Servidor rodando em http://localhost:${PORT}.`);

  const controller = new UauCustomerController()
  // const data = await controller.findAdressCostumer(18808)
  /* const data = await controller.deletePhoneCostumer(28002, [
    {
      DDD: '031',
      telefone: "96949766",
      Complemento: "whatsapp",
      Principal: 1,
      Tipo: 0
    },
    {
      DDD: '031',
      telefone: "32720333",
      Complemento: "fixo",
      Principal: 0,
      Tipo: 1
    },
    {
      DDD: '031',
      telefone: "989062492",
      Complemento: "corporativo",
      Principal: 1,
      Tipo: 2
    }
  ]) */
  /*   const data = await controller.recordPhoneCostumer(28002, [
      {
        DDD: '031',
        telefone: "96949766",
        Complemento: "whatsapp",
        Principal: 1,
        Tipo: 0
      },
      {
        DDD: '031',
        telefone: "32720333",
        Complemento: "fixo",
        Principal: 0,
        Tipo: 1
      },
      {
        DDD: '031',
        telefone: "989062492",
        Complemento: "corporativo",
        Principal: 1,
        Tipo: 2
      }
    ]) */



});
