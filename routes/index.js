const express = require("express");
const router = express.Router();
router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
router.get("/", async (req, res, next) => {
  return res.render("main");
});
router.get("/join", async (req, res, next) => {
  return res.render("join");
});
module.exports = router;
