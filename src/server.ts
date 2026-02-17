import { configDotenv } from "dotenv";
import app from "./app";
import { ParcelaAReceber, ResumoVenda } from "Services/Uau/Sale/uau.sale.types";
import Console from "./Lib/Console";
import SaleUauWorker from "./Workers/Uau/sale.uau.worker";

configDotenv();

const PORT = process.env.PORT!;
const HOST = process.env.HOST!;


app.listen(PORT, async () => {
  Console({ type: "success", message: `Servidor rodando em http://${HOST}:${PORT}` });

  const salesW = new SaleUauWorker()
  await salesW.start('2026-01-01', '2026-01-10')
});
