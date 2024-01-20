import "dotenv/config";
import { fetchHelper } from "./helper";
import * as assert from "assert";

describe("Integration tests", () => {
  const baseURL = `http://localhost:${process.env.PORT}`;

  it("Hello world test", async () => {
    const resp = await fetchHelper(baseURL, {}, "GET");
    assert.deepEqual(resp, { message: "hello world!" });
  });
});
