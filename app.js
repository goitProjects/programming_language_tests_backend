const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sassMiddleware = require("node-sass-middleware");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require("./utils/swagger/swagger.json");

// Import Router
const router = require("./routes/routes");

require("dotenv").config();
const app = express();

mongoose.connect(
  process.env.MONGO_DB_URL,
  { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
  () => {
    console.log("MongoDB connected");
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.disable("x-powered-by");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors("*"));
// app.use(helmet());
app.use(
  sassMiddleware({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use("/", express.static("public"));
app.use("/language_descr", express.static("public"));
app.use("/test", express.static("public"));
app.use("/result", express.static("public"));
app.use("/contacts", express.static("public"));
app.use("/api", router);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/images", express.static("images"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
