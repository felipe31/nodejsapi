import fetch, { RequestInit, Response } from "node-fetch";
import { ConsecutiveAward } from "../src/types";

/**
 *
 *
 * @export
 * @param {string} url
 * @param {*} [data]
 * @param {("GET" | "POST" | "PATCH" | "PUT" | "DELETE")} [method="GET"]
 * @return {*}  {Promise<{ status: number; data: unknown }>}
 */
export async function fetchHelper(
  url: string,
  data?: any,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET"
): Promise<{ status: number; data: unknown }> {
  const reqObj: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (method !== "GET") {
    reqObj.body = JSON.stringify(data);
  }
  const toReturn = { status: 0, data: {} as unknown };
  return fetch(url, reqObj)
    .then((e: Response) => {
      toReturn.status = e.status;
      return e.json();
    })
    .then((e: unknown) => {
      toReturn.data = e;
      return toReturn;
    });
}

/**
 * Check if all properties of `a` and `b` are the same
 *
 * @export
 * @param {ConsecutiveAward} a
 * @param {ConsecutiveAward} b
 * @return {*}  {boolean}
 */
export function compareConsecutiveAward(
  a: ConsecutiveAward,
  b: ConsecutiveAward
): boolean {
  return (
    a &&
    b &&
    a.followingWin === b.followingWin &&
    a.interval === b.interval &&
    a.previousWin === b.previousWin &&
    a.producer === b.producer
  );
}
