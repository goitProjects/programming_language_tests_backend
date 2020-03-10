const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", function(req, res) {
  res.json({ simple: "dongle" });
});

module.exports = router;
