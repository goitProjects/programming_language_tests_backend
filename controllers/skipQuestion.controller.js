// const Result = require("../models/results.model");
const UserQuestion = require("../models/userQuestion.model");
// const checkAllQuestionsSend = require("../middleware/CheckAllQuestionsSend");

const skipQuestion = async (req, res) => {
  const userId = req.params.userId;
  const questionId = req.body.questionId;
  let questionNumber = req.body.questionNumber;
  console.log(questionId);
  try {
    if (questionNumber === 15) {
      console.log({ questionNumber: questionNumber });
      await UserQuestion.updateMany(
        { userId: userId },
        { $set: { lastQuestionSended: true } },
        { new: true },
        err => {
          if (err) {
            res.status(500).json({
              message: "Error in lastQuestionSended change to true",
              error: err
            });
          }
        }
      );
    }

    console.log("start change to sendToUser: false");
    await UserQuestion.findOneAndUpdate(
      {
        _id: questionId,
        userId: userId
      },
      { $set: { sendToUser: false } },
      { new: true }
    )
      .then(async resultUpdateSkipQuestion => {
        if (resultUpdateSkipQuestion) {
          console.log("start search new question");
          if (resultUpdateSkipQuestion.lastQuestionSended) {
            // search not send question
            console.log("15 question answered or skip");
            UserQuestion.findOne({
              userId: userId,
              lastQuestionSended: true,
              sendToUser: false
            })
              .then(async question => {
                console.log({ question });
                const updateNextQuestion = await UserQuestion.findByIdAndUpdate(
                  question._id,
                  { $set: { sendToUser: true } },
                  { new: true }
                );

                const newQuestion = {
                  questionId: updateNextQuestion._id,
                  questionText: updateNextQuestion.questionText,
                  code: updateNextQuestion.code,
                  image: updateNextQuestion.image,
                  imageMobile: updateNextQuestion.imageMobile,
                  answers: updateNextQuestion.answers
                };

                if (updateNextQuestion) {
                  res
                    .status(200)
                    .json({
                      questionNumber: updateNextQuestion.questionNumberCounter,
                      allQuestionsCount: 15,
                      languageTitle: updateNextQuestion.languageTitle,
                      userId: userId,
                      nextQuestion: await newQuestion
                    })
                    .end();
                }
              })
              .catch(err => {
                res
                  .status(400)
                  .json({
                    error: err,
                    message: err.message
                  })
                  .end();
              });
          } else {
            questionNumber = questionNumber + 1;

            const userAllQuestion = await UserQuestion.findOne({
              userId: userId,
              questionNumberCounter: questionNumber,
              lastQuestionSended: false
            });
            console.log({ userAllQuestion });

            const updateNextQuestion = await UserQuestion.findByIdAndUpdate(
              userAllQuestion._id,
              { $set: { sendToUser: true } },
              { new: true }
            );

            const newQuestion = {
              questionId: updateNextQuestion._id,
              questionText: updateNextQuestion.questionText,
              code: updateNextQuestion.code,
              image: updateNextQuestion.image,
              imageMobile: updateNextQuestion.imageMobile,
              answers: updateNextQuestion.answers
            };

            if (updateNextQuestion) {
              res.status(200).json({
                questionNumber,
                allQuestionsCount: 15,
                languageTitle: updateNextQuestion.languageTitle,
                userId: userId,
                nextQuestion: await newQuestion
              });
            }
          }
        }
      })
      .catch(err => {
        res.status(400).json({
          where:
            "If question skip, in method update this question to sendToUser: false",
          error: err,
          message: err.message
        });
      });
  } catch (error) {
    res.json({
      error: error.message
    });
  }
};

module.exports = { skipQuestion };
