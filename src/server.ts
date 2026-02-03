import { configDotenv } from "dotenv";

import app from "./app";

configDotenv();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Servidor iniciado.");
  console.log(`Servidor rodando em http://localhost:${PORT}.`);
});
