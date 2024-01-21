import "dotenv/config";
import { fetchHelper } from "./helper";
import * as assert from "assert";

describe("Integration tests", () => {
  const baseURL = `http://localhost:${process.env.PORT}`;

  it("Hello world test", async () => {
    const resp = await fetchHelper(baseURL, {}, "GET");
    assert.deepEqual(resp, {
      movie: { name: "Movie 1", year: 1995, winner: true, Producers: [{ name: "Producer 1" }] },
    });
  });
});
