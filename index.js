const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const articleRoute = require("./routes").article;
const passport = require("passport");
require("./config/passport")(passport);
require("./config/passport-google");
const cors = require("cors");

//connect to mongodb

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("connect to Mongo Altas.");
  })
  .catch((e) => {
    console.log(e);
  });

//middleware
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(cors());
app.use(express.static("uploads"));
//測試部署
app.get("/test", (req, res) => {
  res.json({ message: "test is working" });
});
//使用 /api/user 這個路徑套用authRoute
app.use("/api/user", authRoute);
//用passport.authenticate來保護 ./api/article 這個路徑，沒有token的訪客無法使用
app.use(
  "/api/articles",
  passport.authenticate("jwt", { session: false }),
  articleRoute
);
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Express Server started on port ${port}`);
});
