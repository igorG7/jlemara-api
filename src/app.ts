import express from "express";
import cors from "cors";
import "./modules/redis/infra/redis";
import ConnectionDB from "./db/ConnectionDB";
import cookieParser from "cookie-parser";
import routes from "./modules/routes/routes";

class App {
  public app;

  constructor() {
    this.app = express();
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

  async init() {
    await ConnectionDB.connect();
  }
}

const appInstance = new App();

export const init = () => appInstance.init();
export default appInstance.app;
