import { Model, Optional, Sequelize, Transaction } from "sequelize";
import { Movie, Producer, Studio, sequelize } from "./model";
import { parseCSV } from "./parser";

export async function initializeDB(path?: string): Promise<Sequelize> {
  // Create tables
  await sequelize.sync({ force: true });

  const rows = await parseCSV(path);
  for (const row of rows) {
    // Extract movie
    let movie = await Movie.findOne({
      where: {
        year: +row[0],
        name: row[1],
        winner: row[4] === "yes",
      },
    });

    if (!movie) {
      movie = await Movie.create({
        year: +row[0],
        name: row[1],
        winner: row[4] === "yes",
      });
    }

    // Extract producers
    const producerNames = splitNameString(row[3]);

    const producers: Producer[] = [];
    for (const name of producerNames) {
      let producer = await Producer.findOne({ where: { name } });

      if (!producer) {
        producer = await Producer.create({ name });
      }

      producers.push(producer);
    }
    await movie.addProducers(producers);

    // Extract studios
    const studioNames = splitNameString(row[2]);

    const studios: Studio[] = [];
    for (const name of studioNames) {
      let studio = await Studio.findOne({ where: { name } });

      if (!studio) {
        studio = await Studio.create({ name });
      }

      studios.push(studio);
    }
    await movie.addStudios(studios);
  }

  return sequelize;
}

/**
 * Split names by `,` and ` and `
 *
 * @param {string} names
 * @return {*}
 */
function splitNameString(names: string) {
  const splittedNames: string[] = [];
  if (names) {
    const splitted = names.split(",");

    for (let name of splitted) {
      const andName = name.split(" and ");

      if (andName.length === 2) {
        splitted.push(andName[1]);
      }

      name = andName[0].trim();
      if (!name) {
        continue;
      }

      splittedNames.push(name);
    }
  }
  return splittedNames;
}
