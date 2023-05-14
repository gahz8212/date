const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models");
const bcrypt = require("bcrypt");
module.exports = () => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            if (exUser.status === true) {
              if (exUser.loginAt < exUser.logoutAt) {
                done(null, false, {
                  message: "다른 PC에서 로그인 되어 있습니다.",
                });
              } else {
                await User.update(
                  { status: false },
                  { where: { id: exUser.id } }
                );
                done(null, exUser);
              }
            } else {
              const result = await bcrypt.compare(password, exUser.password);
              if (result) {
                done(null, exUser);
              } else {
                done(null, false, { message: "비밀번호 오류 입니다." });
              }
            }
          } else {
            done(null, false, { message: "가입되지 않은 이메일 입니다." });
          }
        } catch (e) {
          console.log(e);
          done(e);
        }
      }
    )
  );
};
