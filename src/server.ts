import express, { Request, Response, Router } from "express";

const app = express();

const router = Router();

app.use(express.json());
app.use(router);

const port = 3000;
app.listen(port, () => console.log(`The server is running on port ${port}`));

// Temp endpoint
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello world!" });
});
