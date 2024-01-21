import { Model, Sequelize, INTEGER, BOOLEAN, STRING } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db/database.sqlite3",

  define: {
    freezeTableName: true,
  },
});

export class Producer extends Model {
  public addMovies!: (movies: Movie[], options?: any) => Promise<void>;
}

Producer.init(
  {
    name: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Producer",
  },
);

export class Movie extends Model {
  public addProducers!: (producers: Producer[], options?: any) => Promise<void>;
  public addStudios!: (studios: Studio[], options?: any) => Promise<void>;
}

Movie.init(
  {
    name: {
      type: STRING,
      allowNull: false,
    },
    winner: {
      type: BOOLEAN,
    },
    year: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Movie",
  },
);

export class Studio extends Model {
  public addMovies!: (movies: Movie[], options?: any) => Promise<void>;
}

Studio.init(
  {
    name: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Studio",
  },
);

Movie.belongsToMany(Producer, { through: "MovieProducer" });
Producer.belongsToMany(Movie, { through: "MovieProducer" });

Movie.belongsToMany(Studio, { through: "MovieStudio" });
Studio.belongsToMany(Movie, { through: "MovieStudio" });
