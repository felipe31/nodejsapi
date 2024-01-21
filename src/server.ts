import "dotenv/config";
import express, { Request, Response, Router } from "express";
import { initializeDB } from "./dbInitializer";
import { Sequelize } from "sequelize";

const app = express();

const router = Router();

app.use(express.json());
app.use(router);

const port = process.env.PORT;

initializeDB(process.env.CSV_PATH).then((sequelize: Sequelize) => {
  // Make models and sequelize instance available to endpoints
  app.set("sequelize", sequelize);
  app.set("models", sequelize.models);

  app.listen(port, () => console.log(`The server is running on port ${port}`));
});

// Temp endpoint
router.get("/", async (req: Request, res: Response) => {
  const { Movie, Producer, Studio } = app.get("models");

  const movie = await Movie.findByPk(22, {
    attributes: ["name", "winner", "year"],
    include: [
      {
        model: Producer,
        attributes: ["name"],
        through: {
          attributes: [],
        },
      },
      {
        model: Studio,
        attributes: ["name"],
        through: {
          attributes: [],
        },
      },
    ],
  });

  res.json({ movie });
});
