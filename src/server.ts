import { configDotenv } from "dotenv";
import app from "./app";
import Console from "./Lib/Console";
import UauSaleService from "./Services/Uau/Sale/uau.sale.service";

configDotenv();

const PORT = process.env.PORT!;
const HOST = process.env.HOST!;

app.listen(PORT, async () => {
  Console({ type: "success", message: `Servidor rodando em http://${HOST}:${PORT}` });

  const uauSale = new UauSaleService()

  const lista = await uauSale.retornaChavesVendas('2025-01-01', '2025-01-10', '0')
  console.log(lista)
});
