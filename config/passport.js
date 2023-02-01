//使用passport-jwt 來認證jsonwebtoken  passport-jwt 是passport的一個strategy

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models").userModel;

//要注意是export 一個function 出去
module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET;
  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    })
  );
};
