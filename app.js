require("dotenv").config();
const express = require("express");
const app = express();
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(compression());
app.use(helmet());

// ====================== ROUTES IMPORTS ====================================================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const subjectRoutes = require("./routes/subject.routes");
const paymentRoutes = require("./routes/payment.routes");

// ====================== USE ROUTES =========================================================
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", subjectRoutes);
app.use("/api", paymentRoutes);

// ======================= SAMPLE TESTING ROUTE =============================================
app.get("/my-app", (req, res) => {
  res.send("hello.. you are runnig production api for educulture..");
});

// ======================= PORT DECLARATION =================================================
const port = process.env.PORT || 3000;

// ======================= LISTEN ON PORT ===================================================
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
