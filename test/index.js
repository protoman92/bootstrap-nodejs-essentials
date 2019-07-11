require("../src/global");
const { initializeDB, UserModel } = require("./db");
const express = require("express");
const app = express();
const createMongoRouter = require("../src/route/standardMongo").default;

app.use(express.json());

app.use(
  "/users",
  createMongoRouter(express.Router(), { mongoModel: UserModel })
);

const port = process.env.PORT || 8000;

async function initialize() {
  await initializeDB();
  app.listen(port, () => console.log(`Server listing to port ${port}`));
}

initialize();
