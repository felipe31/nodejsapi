import "dotenv/config";
import { fetchHelper } from "./helper";
import * as assert from "assert";
import { Movie, Producer, Studio, sequelize } from "../src/model";

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
    const movie = await Movie.create({
      year: 111,
      name: `Insert test ${rand}`,
      winner: true,
    });

    await movie.addProducers([
      await Producer.create({ name: `Prod insert test ${rand}` }),
    ]);
    await movie.addStudios([
      await Studio.create({ name: `Studio insert test ${rand}` }),
    ]);

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

  it.skip("Consecutive Awards", async () => {
    const movieLongest1 = await Movie.create({
      year: 1,
      name: `M1 ${rand}`,
      winner: true,
    });
    const movieLongest2 = await Movie.create({
      year: 2000,
      name: `M2 ${rand}`,
      winner: true,
    });
    const producerLongest = await Producer.create({
      name: `Longest gap ${rand}`,
    });
    await movieLongest1.addProducers([producerLongest]);
    await movieLongest2.addProducers([producerLongest]);

    const movieShortest1 = await Movie.create({
      year: 1,
      name: `M1 ${rand}`,
      winner: true,
    });
    const movieShortest2 = await Movie.create({
      year: 2000,
      name: `M2 ${rand}`,
      winner: true,
    });
    const producerShortest = await Producer.create({
      name: `Shortest gap ${rand}`,
    });
    await movieShortest1.addProducers([producerShortest]);
    await movieShortest2.addProducers([producerShortest]);

    const endpoint = `${baseURL}/consecutive-award-gaps`;

    const resp = (await fetchHelper(endpoint, {}, "GET")) as {
      min: [];
      max: [];
    };
    assert.ok(resp?.max, "Field max must exist");
    assert.ok(resp?.min, "Field min must exist");
  });
});
