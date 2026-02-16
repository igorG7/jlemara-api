import { configDotenv } from "dotenv";

import app from "./app";

configDotenv();

const PORT = process.env.PORT!;
const HOST = process.env.HOST!;

app.listen(PORT, async () => {

  console.log("Servidor iniciado.");
  console.log(`Servidor rodando em http://${HOST}:${PORT}.`);

});
