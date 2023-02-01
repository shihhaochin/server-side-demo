const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  auther: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  message: [
    {
      speakerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      nickname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
      },
      say: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 800,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      default: [],
    },
  ],
  category: {
    type: String,
    enum: ["就醫經驗談", "身體有問題", "中西醫雜談"],
    required: true,
  },
  image: [
    {
      dataName: String,
      data: Buffer,
      contentType: String,

      uploadTime: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Article", articleSchema);
