import "dotenv/config";
import {
  ConsecutiveAward,
  compareConsecutiveAward,
  fetchHelper,
} from "./helper";
import * as assert from "assert";
import { Movie, Producer, Studio, sequelize } from "../src/model";
import { Model } from "sequelize";

describe("Integration tests", () => {
  const baseURL = `http://localhost:${process.env.PORT}`;

  beforeAll(async () => {
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const rand = Math.random();

  it("Insert", async () => {
    const toDestroy: Model[] = [];
    const movie = await Movie.create({
      year: 111,
      name: `Insert test ${rand}`,
      winner: true,
    });
    toDestroy.push(movie);

    const producer = await Producer.create({
      name: `Prod insert test ${rand}`,
    });
    toDestroy.push(producer);

    const studio = await Studio.create({ name: `Studio insert test ${rand}` });
    toDestroy.push(studio);

    await movie.addProducers([producer]);
    await movie.addStudios([studio]);

    const resp = await fetchHelper(
      `${baseURL}/movies/${movie.get("id")}`,
      {},
      "GET"
    );

    assert.deepEqual(
      resp,
      {
        movie: {
          name: `Insert test ${rand}`,
          year: 111,
          winner: true,
          Producers: [{ name: `Prod insert test ${rand}` }],
          Studios: [{ name: `Studio insert test ${rand}` }],
        },
      },
      "Producer, Studio and Movie rows should exist and be connected"
    );
    await Promise.all(toDestroy.map(async (row) => await row.destroy()));
  });

  it("Delete", async () => {
    const movie = await Movie.create({
      year: 222,
      name: `Delete test ${rand}`,
      winner: true,
    });

    const producer = await Producer.create({
      name: `Prod delete test ${rand}`,
    });
    await movie.addProducers([producer]);
    const studio = await Studio.create({ name: `Studio delete test ${rand}` });
    await movie.addStudios([studio]);
    const movieEndpoint = `${baseURL}/movies/${movie.get("id")}`;

    let resp = await fetchHelper(movieEndpoint, {}, "GET");

    assert.deepEqual(
      resp,
      {
        movie: {
          name: `Delete test ${rand}`,
          year: 222,
          winner: true,
          Producers: [{ name: `Prod delete test ${rand}` }],
          Studios: [{ name: `Studio delete test ${rand}` }],
        },
      },
      "Producer, Studio and Movie rows should exist and be connected"
    );

    producer.destroy();
    studio.destroy();
    resp = await fetchHelper(movieEndpoint, {}, "GET");

    assert.deepEqual(
      resp,
      {
        movie: {
          name: `Delete test ${rand}`,
          year: 222,
          winner: true,
          Producers: [],
          Studios: [],
        },
      },
      "Producer and Studio rows linked to this movie were destroid. Both arrays should be empty"
    );
    movie.destroy();
    resp = await fetchHelper(movieEndpoint, {}, "GET");

    assert.deepEqual(resp, { movie: null }, "Movie row was destroid");
  });

  it("Consecutive Awards", async () => {
    const toDestroy: Model[] = [];

    // Longest
    const movieLongest1 = await Movie.create({
      year: 1,
      name: `ML1 ${rand}`,
      winner: true,
    });
    toDestroy.push(movieLongest1);

    const movieLongest2 = await Movie.create({
      year: 2000,
      name: `ML2 ${rand}`,
      winner: true,
    });
    toDestroy.push(movieLongest2);

    const producerLongest = await Producer.create({
      name: `Longest gap ${rand}`,
    });
    toDestroy.push(producerLongest);

    await movieLongest1.addProducers([producerLongest]);
    await movieLongest2.addProducers([producerLongest]);

    const longest: ConsecutiveAward = {
      producer: producerLongest.get("name") as string,
      interval:
        (movieLongest2.get("year") as number) -
        (movieLongest1.get("year") as number),
      previousWin: movieLongest1.get("year") as number,
      followingWin: movieLongest2.get("year") as number,
    };

    // Shortest
    const movieShortest1 = await Movie.create({
      year: 1,
      name: `MS1 ${rand}`,
      winner: true,
    });
    toDestroy.push(movieShortest1);

    const movieShortest2 = await Movie.create({
      year: 1,
      name: `MS2 ${rand}`,
      winner: true,
    });
    toDestroy.push(movieShortest2);

    const producerShortest = await Producer.create({
      name: `Shortest gap ${rand}`,
    });
    toDestroy.push(producerShortest);

    await movieShortest1.addProducers([producerShortest]);
    await movieShortest2.addProducers([producerShortest]);

    const shortest: ConsecutiveAward = {
      producer: producerShortest.get("name") as string,
      interval:
        (movieShortest2.get("year") as number) -
        (movieShortest1.get("year") as number),
      previousWin: movieShortest1.get("year") as number,
      followingWin: movieShortest2.get("year") as number,
    };

    // Get endpoint data
    const endpoint = `${baseURL}/consecutive-award-gaps`;

    const resp = (await fetchHelper(endpoint, {}, "GET")) as {
      min: ConsecutiveAward[];
      max: ConsecutiveAward[];
    };
    assert.ok(resp?.max, "Field max must exist");
    assert.ok(resp?.min, "Field min must exist");

    assert.equal(
      resp.min.filter((award) => compareConsecutiveAward(award, shortest))
        .length,
      1,
      "The API should return the shortest consecutive award"
    );

    assert.equal(
      resp.max.filter((award) => compareConsecutiveAward(award, longest))
        .length,
      1,
      "The API should return the longest consecutive award"
    );

    await Promise.all(toDestroy.map(async (row) => await row.destroy()));
  });
});
