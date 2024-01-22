import "dotenv/config";
import express from "express";
import { initializeDB } from "./dbInitializer";
import { Sequelize } from "sequelize";
import { routes } from "./routes";

const app = express();

app.use(express.json());
app.use(routes);

initializeDB(process.env.CSV_PATH).then((sequelize: Sequelize) => {
  // Make models and sequelize instance available to endpoints
  app.set("sequelize", sequelize);

  const port = process.env.PORT;
  app.listen(port, () => console.log(`The server is running on port ${port}`));
});
