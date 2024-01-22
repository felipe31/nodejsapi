import fetch, { RequestInit, Response } from "node-fetch";

export type ConsecutiveAward = {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
};

export async function fetchHelper(
  url: string,
  data?: any,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET"
): Promise<unknown> {
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
    .then((e: Response) => e.json())
    .then((e: unknown) => {
      return e;
    });
}

export function compareConsecutiveAward(
  award: ConsecutiveAward,
  shortest: ConsecutiveAward
): boolean {
  return (
    award &&
    shortest &&
    award.followingWin === shortest.followingWin &&
    award.interval === shortest.interval &&
    award.previousWin === shortest.previousWin &&
    award.producer === shortest.producer
  );
}
