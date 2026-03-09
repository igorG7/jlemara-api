import { configDotenv } from "dotenv";

import app, { init } from "./app";

configDotenv();

const PORT = process.env.PORT!;
const HOST = process.env.HOST!;

init().then(() => {
  app.listen(PORT, async () => {
    console.log("Servidor iniciado.");
    console.log(`Servidor rodando em http://${HOST}:${PORT}.`);



  });
});
