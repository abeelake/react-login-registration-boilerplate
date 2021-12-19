const express = require("express");

const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// connect to mongodb
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log("DB CONNECTION ERR:", err));

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// app middlewares
app.use(morgan("dev"));
app.use(express.json()); // convert json string to js object

// app.use(cors()) // allows all origins (frontend and backend)
if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: `http://localhost:3000` })); // allows all origins (frontend and backend)
}

// middleware for routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);

// port number to run the application (either get from .env file or use 8000)
const port = process.env.PORT || 8000;

// listen to the port
app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});
