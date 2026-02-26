import { configDotenv } from "dotenv";

import app from "./app";
import UnidadeUauWorker from "./Workers/Erp/unidade.erp.worker";

configDotenv();

const PORT = process.env.PORT!;
const HOST = process.env.HOST!;

app.listen(PORT, async () => {

  console.log("Servidor iniciado.");
  console.log(`Servidor rodando em http://${HOST}:${PORT}.`);

  const a = new UnidadeUauWorker()

  a.start()

});
