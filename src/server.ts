import "dotenv/config";
import express, { Request, Response, Router } from "express";
import { Movie, Producer, sequelize } from "./model";

const app = express();

const router = Router();

app.use(express.json());
app.use(router);

// Make models and sequelize instance available to endpoints
app.set("sequelize", sequelize);

const port = process.env.PORT;

initializeDB().then(() => app.listen(port, () => console.log(`The server is running on port ${port}`)));

// Temp endpoint
router.get("/", async (req: Request, res: Response) => {
  const movie = await Movie.findByPk(1, {
    attributes: ["name", "winner", "year"],
    include: {
      model: Producer,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });

  res.json({ movie });
});

async function initializeDB() {
  // Create tables
  await sequelize.sync({ force: true });

  // Temp data
  const movie = await Movie.create({
    name: "Movie 1",
    year: 1995,
    winner: true,
  });
  const producer = await Producer.create({
    name: "Producer 1",
  });

  movie.addProducers([producer]);
}
