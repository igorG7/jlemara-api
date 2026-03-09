import mongoose from "mongoose";

class ConnectDB {
  async connect() {
    try {
      const keyConnect = process.env.MONGODB_URI;
      await mongoose.connect(keyConnect as string);
      console.log("Conectado ao banco");
    } catch (error) {
      console.log("Não foi possível conectar ao banco de dados.", error);
    }
  }
}

export default new ConnectDB();
