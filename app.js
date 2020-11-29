require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

// Database connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((err) => console.log("error in DB connection", err));

//Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(compression());

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Use Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);

// sample test route
app.get("/my-app", (req, res) => {
  res.send("hello.. tour app is running..");
});

//PORT
const port = process.env.PORT || 3000;

//Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
