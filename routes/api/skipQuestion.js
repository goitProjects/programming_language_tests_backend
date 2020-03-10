const express = require("express");
const router = express.Router();

const skipQuestionController = require("../../controllers/skipQuestion.controller");

/* GET users listing. */
router.route("/:userId").post(skipQuestionController.skipQuestion);

module.exports = router;
