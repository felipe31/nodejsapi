import fetch, { RequestInit, Response } from "node-fetch";
import { ConsecutiveAward, ConsecutiveAwardGaps } from "../src/types";
import { splitNameString } from "../src/dbInitializer";

type _Producers = Map<string, _Movie[]>;
type _Movie = {
  year: number;
  name: string;
  winner: boolean;
};

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

/**
 * Parse movie rows following the pattern `[<year>, <name>, <studios>, <producer>, <winner>][]`
 * into a `_Producers` object
 *
 * @export
 * @param {string[][]} rows
 * @return {*}  {_Producers}
 */
export function rowsToProducers(rows: string[][]): _Producers {
  const toReturn: _Producers = new Map<string, _Movie[]>();

  for (const row of rows) {
    const movie: _Movie = {
      year: +row[0],
      name: row[1],
      winner: row[4] === "yes",
    };

    const producerString = row[3];
    const producers = splitNameString(producerString);

    for (const producer of producers) {
      const movies = toReturn.get(producer) || [];

      toReturn.set(producer, insertionSort(movies, movie));
    }
  }
  return toReturn;
}

/**
 * Find the consecutive gaps based on `_Producers`
 *
 * @export
 * @param {_Producers} producers
 * @return {*}  {ConsecutiveAwardGaps}
 */
export function findConsecutiveAwardGaps(
  producers: _Producers
): ConsecutiveAwardGaps {
  const toReturn: ConsecutiveAwardGaps = { min: [], max: [] };
  for (let [producer, movies] of producers.entries()) {
    movies = movies.filter((m) => m.winner);
    if (movies.length < 2) continue;

    // Compare consecutive movies
    for (let i = 0; i < movies.length - 1; i++) {
      const interval = movies[i + 1].year - movies[i].year;

      const consecutive: ConsecutiveAward = {
        interval,
        producer: producer,
        previousWin: movies[i].year,
        followingWin: movies[i + 1].year,
      };

      if (!toReturn.min[0] || interval < toReturn.min[0].interval) {
        toReturn.min = [consecutive];
      } else if (interval === toReturn.min[0].interval) {
        toReturn.min.push(consecutive);
      }

      if (!toReturn.max[0] || interval > toReturn.max[0].interval) {
        toReturn.max = [consecutive];
      } else if (interval === toReturn.max[0].interval) {
        toReturn.max.push(consecutive);
      }
    }
  }

  return toReturn;
}

/**
 * Uses the online attribute of insertion sort.
 * Assume `movies` as sorted, as it's built from scretch.
 *
 * @param {_Movie[]} movies
 * @param {_Movie} movie
 * @return {*}  {_Movie[]}
 */
function insertionSort(movies: _Movie[], movie: _Movie): _Movie[] {
  let i = movies.findIndex((m) => movie.year < m.year);

  if (i === -1) i = movies.length;
  movies.splice(i, 0, movie);

  return movies;
}
