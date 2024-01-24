import { Model, Optional, Sequelize, Transaction } from "sequelize";
import { Movie, Producer, Studio, sequelize } from "./model";
import { parseCSV } from "./parser";

/**
 * Create/replace tables according to the model.
 *
 * If `path` is provided, parses the data from a .csv file into the database
 *
 * @export
 * @param {string} [path]
 * @return {*}  {Promise<Sequelize>}
 */
export async function initializeDB(path?: string): Promise<Sequelize> {
  // Create tables
  await sequelize.sync({ force: true });

  if (path) {
    const rows = await parseCSV(path);

    for (const row of rows) {
      const year = +row[0];
      const name = row[1];
      const studioString = row[2];
      const producerString = row[3];
      const winner = row[4] === "yes";

      // Extract movie
      let movie = await Movie.findOne({
        where: {
          year,
          name,
          winner,
        },
      });

      if (!movie) {
        movie = await Movie.create({
          year,
          name,
          winner,
        });
      }

      // Extract producers
      const producerNames = splitNameString(producerString);

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
      const studioNames = splitNameString(studioString);

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
  }

  return sequelize;
}

/**
 * Split names by `,` and ` and `
 *
 * @param {string} names
 * @return {*}
 */
export function splitNameString(names: string) {
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
