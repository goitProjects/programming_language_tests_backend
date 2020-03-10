const express = require("express");
const router = express.Router();

const testsController = require("../../controllers/tests.controller");

/* GET users listing. */
router
  .route("/")
  .get(testsController.getLanguages)
  .post(testsController.newLanguage);

router
  .route("/:languageId")
  .get(testsController.start)
  .put(testsController.updateLanguage)
  .delete(testsController.deleteLanguage);

router.route("/cancel/:userId").post(testsController.cancelAnswering);

module.exports = router;
