const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const router = express.Router();

const { User } = require("../models");

router.post("/join", async (req, res, next) => {
  const nick = req.body.nick;
  const email = req.body.email;
  const password = req.body.password;
  // console.log(nick, email, password);
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      res.redirect("/join/?joinError=중복된 이메일 입니다.");
    } else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        nick,
        email,
        password: hash,
      });
      return res.redirect("/");
    }
  } catch (e) {
    console.error(e);
    // return next(e);
  }
});
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, async (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      await User.update(
        { loginAt: new Date(), status: true },
        { where: { id: user.id } }
      );
      return res.redirect("/");
    });
  })(req, res, next);
});
router.get("/logout", async (req, res, next) => {
  await User.update(
    { logoutAt: new Date(), status: false },
    { where: { id: req.user.id } }
  );
  return req.logout((e) => {
    if (e) {
      return next(e);
    }
    req.session.destroy();
    return res.redirect("/");
  });
});
module.exports = router;
