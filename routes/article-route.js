const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const Article = require("../models").articleModel;
const Img = require("../models").imgModel;
const articleValidation = require("../validation").articleValidation;

//設定multer用來處理multipart / form - data數據;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.use((req, res, next) => {
  console.log("A request is coming into post api");
  next();
});
//可以取得所有文章資料
router.get("/", (req, res) => {
  //因為在設計model的時候有設定ref:"User" 所以可以用populate額外把相關資料撈出來像username,email等等
  Article.find({})
    .sort({ _id: -1 })
    .populate("auther", ["username", "email"])
    .then((article) => {
      res.send(article);
    })
    .catch(() => {
      res.status(500).send("Error!! Cannot not get article");
    });
});
//可以取得所有就醫經驗文章
router.get("/experience", (req, res) => {
  Article.find({ category: "就醫經驗談" })
    .sort({ _id: -1 })
    .populate("auther", ["username", "email"])
    .then((article) => {
      res.send(article);
    })
    .catch(() => {
      res.status(500).send("Error!! Cannot not get experience article");
    });
});
//可以取得所有身體有問題文章
router.get("/bodyquestion", (req, res) => {
  Article.find({ category: "身體有問題" })
    .sort({ _id: -1 })
    .populate("auther", ["username", "email"])
    .then((article) => {
      res.send(article);
    })
    .catch(() => {
      res.status(500).send("Error!! Cannot not get bodyquestion article");
    });
});
//可以取得所有中西醫雜談文章
router.get("/medicaltalk", (req, res) => {
  Article.find({ category: "中西醫雜談" })
    .sort({ _id: -1 })
    .populate("auther", ["username", "email"])
    .then((article) => {
      res.send(article);
    })
    .catch(() => {
      res.status(500).send("Error!! Cannot not get experience article");
    });
});

//用使用者id找文章
router.get("/auther/:_auther_id", (req, res) => {
  let { _auther_id } = req.params;
  Article.find({ auther: _auther_id })
    .sort({ _id: -1 })
    .populate("auther", ["username", "email"])
    .then((data) => {
      res.send(data);
    })
    .catch(() => {
      res.status(500).send("沒找到相關文章");
    });
});

//用文章id 找文章
router.get("/:_id", (req, res) => {
  let { _id } = req.params;
  Article.findOne({ _id })
    .populate("auther", ["email"])
    .then((article) => {
      res.send(article);
    })
    .catch((e) => {
      res.send(e);
    });
});
//用keyword找文章
router.get("/search/:keyword", (req, res) => {
  let { keyword } = req.params;
  let _filter = {
    $or: [
      { title: { $regex: keyword, $options: "$i" } },
      { content: { $regex: keyword, $options: "$i" } },
    ],
  };
  Article.find(_filter)
    .limit(10)
    .sort({ _id: -1 })
    .populate("auther", ["username", "email"])
    .then((article) => {
      res.send(article);
    })
    .catch(() => {
      res.status(500).send("Error!! Cannot not get anymore article");
    });
});

router.post("/", async (req, res) => {
  //先驗證post 的文章符不符設定
  const { error } = articleValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { title, content, category } = req.body;

  let newArticle = new Article({
    title,
    content,
    category,

    auther: req.user._id,
  });
  try {
    await newArticle.save();
    res.status(200).send("New article has been saved.");
  } catch (err) {
    res.status(400).send("Cannot save article.");
    console.log(err);
  }
});
//把圖片存入img-model
router.post("/upload", upload.single("image"), async (req, res) => {
  console.log(req.file);
  const saveImage = new Img({
    name: req.file.originalname,
    img: {
      data: fs.readFileSync("uploads/" + req.file.filename),
      contentType: req.file.mimetype,
    },
  });
  await saveImage
    .save()
    .then(() => {
      res.json("img upload success");
    })
    .catch((err) => {
      console.log(err);
    });
});
//把img插入Article
router.post("/upload/:_id", upload.single("image"), async (req, res) => {
  let { _id } = req.params;
  let dataName = req.file.originalname;
  let data = fs.readFileSync("uploads/" + req.file.filename);
  let contentType = req.file.mimetype;
  try {
    let article = await Article.findOne({ auther: { _id } }).sort({ _id: -1 });
    article.image.push({ dataName, data, contentType });
    await article.save();
    res.send("img insert success.");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//在文章中留言
router.post("/message/:_id", async (req, res) => {
  let { _id } = req.params;
  let { speakerID, nickname, say } = req.body;
  try {
    let article = await Article.findOne({ _id });
    article.message.push({ say, nickname, speakerID });
    await article.save();
    res.send("留言成功");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//修改自己發的貼文 *_id = 文章id
router.patch("/:_id", async (req, res) => {
  //一樣修改文章之前先確認格式對不對
  const { error } = articleValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  let article = await Article.findOne({ _id });
  if (!article) {
    res.status(404);
    return res.json({
      success: false,
      message: "Article not found",
    });
  }
  if (article.auther.equals(req.user._id)) {
    Article.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send("Article updated.");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message: "Only auther of this article can edit this article ",
    });
  }
});
//修改文章圖片
router.patch("/upload/:_id", upload.single("image"), async (req, res) => {
  let { _id } = req.params;
  let dataName = req.file.originalname;
  let data = fs.readFileSync("uploads/" + req.file.filename);
  let contentType = req.file.mimetype;
  try {
    let article = await Article.findOne({ _id });
    article.image.splice(0);
    article.image.push({ dataName, data, contentType });
    await article.save();
    res.send("img insert success.");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//刪除自己發的貼文
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  let article = await Article.findOne({ _id });

  if (!article) {
    res.status(404);
    return res.json({
      success: false,
      message: "Article not found",
    });
  }

  if (article.auther.equals(req.user._id)) {
    Article.deleteOne({ _id })
      .then(() => {
        res.send("Article deleted.");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message: "Only auther of this article can delete this article ",
    });
  }
});

module.exports = router;
