import express from "express";
import cors from "cors";

import ConnectionDB from "./Configs/ConnectionDB";
class App {
  public app;

  constructor() {
    this.app = express();

    this.config();
    this.middlewares();
    this.routes();
  }

  routes() {}

  middlewares() {
    this.app.use(cors({ origin: "*" }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  async config() {
    await ConnectionDB.connect();
  }
}

export default new App().app;
