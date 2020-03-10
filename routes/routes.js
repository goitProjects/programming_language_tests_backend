const router = require("express").Router();

const usersRouter = require("./api/users");
const adminRouter = require("./api/admin");
const testsRouter = require("./api/tests");
const questionsRouter = require("./api/questions");
const answerRouter = require("./api/answer");

router.use("/users", usersRouter);
router.use("/tests", testsRouter);
router.use("/questions", questionsRouter);
router.use("/admin", adminRouter);
router.use("/answer", answerRouter);

module.exports = router;
