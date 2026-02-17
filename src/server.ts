import { configDotenv } from "dotenv";
import app from "./app";
import Console from "./Lib/Console";

configDotenv();

const PORT = process.env.PORT!;
const HOST = process.env.HOST!;

app.listen(PORT, () => {
  Console({ type: "success", message: `Servidor rodando em http://${HOST}:${PORT}` });
});
