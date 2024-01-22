import { Request, Response, Router } from "express";

export const routes = Router();

// Temp endpoint
routes.get("/movies/:id", async (req: Request, res: Response) => {
  const { Movie, Producer, Studio } = req.app.get("models");
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

routes.get("/consecutive-award-gaps", (req: Request, res: Response) => {
  res.json({});
});
