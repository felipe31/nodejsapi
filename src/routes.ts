import { Request, Response, Router } from "express";
import { Movie, Producer, Studio } from "./model";
import { ConsecutiveAward, ConsecutiveAwardGaps } from "./types";

export const routes = Router();

// Temp endpoint
routes.get("/movies/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  const movie = await Movie.findByPk(id, {
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

routes.get("/consecutive-award-gaps", async (req: Request, res: Response) => {
  const toReturn: ConsecutiveAwardGaps = { min: [], max: [] };

  const producers = await Producer.findAll({
    include: {
      model: Movie,
      attributes: ["name", "year"],
      where: { winner: true },
      order: [["year", "ASC"]],
      through: {
        attributes: [],
      },
    },
  });

  for (const producer of producers) {
    const movies = producer.get("Movies") as Movie[];
    if (movies.length === 1) continue;

    for (let i = 0; i < movies.length - 1; i++) {
      const interval =
        (movies[i + 1].get("year") as number) -
        (movies[i].get("year") as number);

      const consecutive: ConsecutiveAward = {
        interval,
        producer: producer.get("name") as string,
        previousWin: movies[i].get("year") as number,
        followingWin: movies[i + 1].get("year") as number,
      };

      if (!toReturn.min[0] || interval < toReturn.min[0].interval) {
        toReturn.min = [consecutive];
      } else if (interval === toReturn.min[0].interval) {
        toReturn.min.push(consecutive);
      }

      if (!toReturn.max[0] || interval > toReturn.max[0].interval) {
        toReturn.max = [consecutive];
      } else if (interval === toReturn.max[0].interval) {
        toReturn.max.push(consecutive);
      }
    }
  }
  res.json(toReturn);
});
