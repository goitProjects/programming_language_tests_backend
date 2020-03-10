const Results = require("../models/results.model");
// const UserQuestion = require("../models/userQuestion.model");

const checkAllQuestionsSend = async ({ userId }) => {
  const getUser = await Results.findById(userId).populate("questions");

  console.log({ getUser });
  const check = getUser.questions.filter(
    question => question.sendToUser === false
  );

  if (check.length > 0) {
    return check;
  } else {
    return false;
  }
};

module.exports = checkAllQuestionsSend;
