import express from "express";
import cors from "cors";
import './Lib/Redis'
import ConnectionDB from "./Configs/ConnectionDB";
import routes from "./Routes/routes";
import cookieParser from "cookie-parser";
class App {
  public app;

  constructor() {
    this.app = express();
    this.config();
    this.middlewares();
    this.routes();
  }

  routes() {
    this.app.use("/", routes);
  }

  middlewares() {
    this.app.use(cors({ origin: "*" }));
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  async config() {
    await ConnectionDB.connect();
  }
}

export default new App().app;
