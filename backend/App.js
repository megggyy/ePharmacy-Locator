const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
require("dotenv/config");


app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use("/public", express.static(__dirname + "/public"));


//Routes
const usersRoutes = require("./routes/users");
const diseasesRoutes = require("./routes/diseases");

const api = process.env.API_URL;


app.use(`${api}/users`, usersRoutes);
app.use(`${api}/diseases`, diseasesRoutes);

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(4000, () => {
  console.log("server is running http://localhost:4000");
});
