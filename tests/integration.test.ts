import { fetchHelper } from "./helper";
import * as assert from "assert";

describe("Integration tests", () => {
  it("Hello world test", async () => {
    const resp = await fetchHelper("http://localhost:3000/", {}, "GET");
    assert.deepEqual(resp, { message: "hello world!" });
  });
});
