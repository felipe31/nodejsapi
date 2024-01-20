import fetch, { RequestInit, Response } from "node-fetch";

export async function fetchHelper(
  url: string,
  data?: any,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
): Promise<JSON> {
  const reqObj: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (method !== "GET") {
    reqObj.body = JSON.stringify(data);
  }

  return fetch(url, reqObj)
    .then((e: Response) => e.json() as Promise<JSON>)
    .then((e: JSON): JSON => {
      return e;
    });
}
