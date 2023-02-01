//所有要經過認證的路徑都會經過這個檔案

const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").userModel;
const { response } = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");

router.use((req, res, next) => {
  console.log("A request is comiing in to auth.js");
  next();
});

router.get("/testAPI", (req, res) => {
  const msgObj = {
    message: "Test API is working.",
  };
  return res.json(msgObj);
});

router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  await User.findOne({ _id })
    .then((userdata) => {
      res.send(userdata);
    })
    .catch(() => {
      res.status(500).send("沒找到使用者");
    });
});

router.post("/register", async (req, res) => {
  // check the validation of register data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //開始寫register 第一步先確認user 是否存在
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).send("Email has already been registered.");
  //如果不存在就開始註冊user
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const savedUser = await newUser.save();

    res.status(200).send({
      msg: "success",
      savedObject: savedUser,
    });
  } catch (err) {
    res.status(400).send("User not saved.");
  }
});

router.post("/login", (req, res) => {
  //一樣先確認資料格式是否正確
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //開始找
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.status(400).send(err);
    }
    if (!user) {
      res.status(401).send("User not found.");
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) return res.status(400).send(err);
        //如果密碼正確就開始製作token
        if (isMatch) {
          const tokenObject = { _id: user._id, email: user.email };
          const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
          res.send({ sucess: true, token: "JWT " + token, user });
        } else {
          res.status(401).send("Wrong password.");
        }
      });
    }
  });
});

//處理google 登入路徑
router.post("/google", async (req, res) => {
  //開始寫register 第一步先確認user 是否存在
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    user.comparePassword(req.body.googleId, function (err, isMatch) {
      if (err) return res.status(400).send(err);
      if (isMatch) {
        const tokenObject = { _id: user._id, email: user.email };
        const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
        res.send({ sucess: true, token: "JWT " + token, user });
      } else {
        res.status(400).send("Error!!!");
      }
    });
  } else {
    //如果不存在就開始註冊user 再登入
    const newUser = new User({
      email: req.body.email,
      password: req.body.googleId,
      thumbnail: req.body.imageUrl,
      username: req.body.googleName,
      googleID: req.body.googleId,
    });
    try {
      const user = await newUser.save();
      const tokenObject = { _id: user._id, email: user.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      res.send({ sucess: true, token: "JWT " + token, user });
    } catch (err) {
      res.status(400).send("User not saved.");
      console.log(err);
    }
  }
});

router.post("/message/:_id", async (req, res) => {
  let { _id } = req.params;
  let { otherUserID, nickname, say } = req.body;
  try {
    let user = await User.findOne({ _id });
    user.message.push({ say, nickname, otherUserID });
    await user.save();
    res.send("留言成功");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

module.exports = router;
