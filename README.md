# Node.js API

An API written in Typescript. It imports data from a CVS file to a SQLite3 database using Sequelize.

## Usage

1. Install project's dependencies:

```sh
yarn install
```

2. Start the server:

```sh
yarn start
```

Or, to enable auto restart:

```sh
yarn dev
```

The server will automatically load the `.csv` file provided through the `CSV_PATH`, included inside the [`.env`](.env) file.

Once the message `The server is running on port <PORT>` shows up, the server is ready to be tested.

Note, the `PORT` number is also defined in the [`.env`](.env) file.

3. Run integration tests:

```sh
yarn test
```

## Database

The database schema is defined by this diagram:

<img src="./db/ERDiagram.jpg?raw=true" width="500" alt="Entity-relashionship diagram">

After reading [this](https://stackoverflow.com/questions/338156/table-naming-dilemma-singular-vs-plural-names) discussion about using plural vs singular naming for entities, I decided to keep **singular** names.

## Endpoints

- Get a particular movie by id:

```
GET /movies/:id
```

Format:

```json
{
  "movie": {
    "name": "Movie 1",
    "year": 2024,
    "winner": true,
    "Producers": [
      {
        "name": "Producer 1"
      },
      {
        "name": "Producer 2"
      }
    ],
    "Studios": [
      {
        "name": "Studio 1"
      },
      {
        "name": "Studio 2"
      }
    ]
  }
}
```

- Find producers with the longest and shortest gaps between consecutive awards:

```
GET /consecutive-award-gaps
```

Format:

```json
{
  "min": [
    {
      "producer": "Producer 1",
      "interval": 1,
      "previousWin": 2001,
      "followingWin": 2002
    }
  ],
  "max": [
    {
      "producer": "Producer 2",
      "interval": 3,
      "previousWin": 2000,
      "followingWin": 2003
    }
  ]
}
```
