require("dotenv").config();
const express = require("express");
const production_app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");
const helmet = require("helmet");

// ===================== DATABASE CONNECTION =======================================

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((err) => console.log("error in DB connection", err));

// ===================== MIDDLEWARES ================================================

production_app.use(bodyParser.urlencoded({ extended: true }));
production_app.use(bodyParser.json());
production_app.use(cors());
production_app.use(compression());
production_app.use(helmet());

// ====================== ROUTES IMPORTS ====================================================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const subjectRoutes = require("./routes/subject.routes");
const paymentRoutes = require("./routes/payment.routes");

// ====================== USE ROUTES =========================================================
production_app.use("/api", authRoutes);
production_app.use("/api", userRoutes);
production_app.use("/api", subjectRoutes);
production_app.use("/api", paymentRoutes);

// ======================= SAMPLE TESTING ROUTE =============================================
production_app.get("/my-app", (req, res) => {
  res.send("hello.. tour app is running..");
});

// ======================= PORT DECLARATION =================================================
const port = process.env.PORT || 3000;

// ======================= LISTEN ON PORT ===================================================
production_app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
