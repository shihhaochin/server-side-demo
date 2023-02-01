const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 100,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 1024,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // google login 所要存入的

  googleID: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  //系統給user的通知
  information: {
    type: [String],
    default: [],
  },
  //別人的私訊
  message: [
    {
      otherUserID: {
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
        maxLength: 50,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      default: [],
    },
  ],
});

//mongoose schma middleware
//這個middleware在我們要存入password之前就給他hash
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } else {
    return next();
  }
});

//在userSchema 放入password 比較方法
//password ：使用者輸入的password
//this.password : 資料庫找到的值

userSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err, isMatch);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("User", userSchema);
