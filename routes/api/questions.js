const express = require("express");
const router = express.Router();

const testsController = require("../../controllers/tests.controller");

/* GET users listing. */
router.route("/").get(testsController.getQuestions);

router
  .route("/:languageId")
  .get(testsController.getQuestionsByLanguageId)
  .post(testsController.newQuestion);
router
  .route("/:questionId")
  .put(testsController.updateQuestion)
  .delete(testsController.deleteQuestion);

module.exports = router;
