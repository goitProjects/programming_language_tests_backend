const express = require("express");
const router = express.Router();

const answerController = require("../../controllers/answer.controller");
const skipQuestionController = require("../../controllers/skipQuestion.controller");

router
  .route("/:userId")
  .post(answerController.getResult)
  .delete(answerController.endAnswering);

router.route("/skip/:userId").post(skipQuestionController.skipQuestion);

module.exports = router;
