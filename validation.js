//這個檔案專門寫送進來的資料是不是符合格式的驗證function
//使用joi套件它很方便使用也可以客製化error msg給使用者

const Joi = require("joi");

//register validation function

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(6).max(100).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(data);
};

//login validation function

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(100).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });
  return schema.validate(data);
};

//post validation function
const articleValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(50).required(),
    content: Joi.string().min(1).max(800).required(),
    category: Joi.string()
      .required()
      .valid("就醫經驗談", "身體有問題", "中西醫雜談"),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.articleValidation = articleValidation;
