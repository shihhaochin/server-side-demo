const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema({
  name: String,
  img: {
    data: Buffer,
    contentType: String,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Img", imgSchema);
