const Result = require("../models/results.model");
const UserQuestion = require("../models/userQuestion.model");
const checkAllQuestionsSend = require("../middleware/CheckAllQuestionsSend");

const getResult = async (req, res) => {
  const userId = req.params.userId;
  const questionId = req.body.questionId;
  const userAnswerNumber = req.body.userAnswerNumber;
  let questionNumber = req.body.questionNumber;

  try {
    if (questionNumber === 15) {
      UserQuestion.updateMany(
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

    const allQuestionSend = await UserQuestion.findOne({ userId: userId });

    if (allQuestionSend.lastQuestionSended) {
      UserQuestion.findOne({
        userId: userId,
        lastQuestionSended: true,
        sendToUser: false
      })
        .then(async question => {
          console.log({ question, getResult: "gg" });
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
      //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      const getStatus = await checkAllQuestionsSend({ userId });

      if (getStatus) {
        //TODO
        //? Send to User skipped Question
        const userQuestion = await UserQuestion.findById(questionId);

        const resultBoolean =
          Number(userQuestion.rightAnswer) === Number(userAnswerNumber);

        const result = {
          rightAnswer: userQuestion.rightAnswer,
          userAnswer: userAnswerNumber,
          questionExplanation: userQuestion.explanation,
          answerCorrectly: resultBoolean
        };

        const updateCurrentQuestion = await UserQuestion.findByIdAndUpdate(
          questionId,
          {
            $set: {
              userAnswer: userAnswerNumber,
              userAnswerCorrectly: resultBoolean
            }
          }
        );

        const updateNextQuestion = await UserQuestion.findByIdAndUpdate(
          getStatus[0]._id,
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

        if (updateCurrentQuestion && updateNextQuestion) {
          res.json({
            result,
            questionNumber: updateNextQuestion.questionNumberCounter,
            allQuestionsCount: 15,
            languageTitle: updateNextQuestion.languageTitle,
            userId: userId,
            nextQuestion: newQuestion
          });
        } else {
          res.status(400).json({
            error: "som wrong"
          });
        }
      } else {
        // TODO
        //? Send to User skipped Question
        const userQuestion = await UserQuestion.findById(questionId);

        const resultBoolean =
          Number(userQuestion.rightAnswer) === Number(userAnswerNumber);

        const result = {
          rightAnswer: userQuestion.rightAnswer,
          userAnswer: userAnswerNumber,
          questionExplanation: userQuestion.explanation,
          answerCorrectly: resultBoolean
        };

        const updateCurrentQuestion = await UserQuestion.findByIdAndUpdate(
          questionId,
          {
            $set: {
              userAnswer: userAnswerNumber,
              userAnswerCorrectly: resultBoolean
            }
          }
        );

        if (updateCurrentQuestion) {
          //! RETURN ALL RESULTS
          const getAllUserAnsweringQuestion = await Result.findById(
            userId
          ).populate("questions");

          const lengthTrulyAnswered = await getAllUserAnsweringQuestion.questions.filter(
            question => question.userAnswerCorrectly
          ).length;

          //TODO
          //? - вирахувати проценти відповідей
          //? - відповідно до проценту взяти текст
          const getTrulyAnsweredInPercentage = (lengthTrulyAnswered / 15) * 100;

          res.json({
            finalResult: true,
            allQuestionsCount: 15,
            result: result,
            userRightAnswered: lengthTrulyAnswered,
            userRightAnsweredInPercentage: getTrulyAnsweredInPercentage,
            languageTitle: getAllUserAnsweringQuestion.languageTitle,
            questions: getAllUserAnsweringQuestion.questions.map(question => ({
              questionId: question._id,
              questionText: question.questionText,
              code: question.code,
              image: question.image,
              imageMobile: question.imageMobile,
              answers: question.answers,
              explanation: question.explanation,
              userAnswerCorrectly: question.userAnswerCorrectly,
              userAnswer: question.userAnswer,
              rightAnswer: question.rightAnswer
            })),
            timeStartAnswering: getAllUserAnsweringQuestion.createdAt
          });
        } else {
          //TODO
          //? Simple checker and return result answering and next question

          const userResult = await Result.findById(userId);

          const userQuestion = await UserQuestion.findById(questionId);

          const resultBoolean =
            Number(userQuestion.rightAnswer) === Number(userAnswerNumber);

          const result = {
            rightAnswer: userQuestion.rightAnswer,
            userAnswer: userAnswerNumber,
            explanation: userQuestion.explanation,
            userAnswerCorrectly: resultBoolean
          };

          const updateCurrentQuestion = await UserQuestion.findByIdAndUpdate(
            questionId,
            {
              $set: {
                userAnswer: userAnswerNumber,
                userAnswerCorrectly: resultBoolean
              }
            }
          );

          const getNextQuestion = await UserQuestion.findById(
            userResult.questions[questionNumber]
          );

          const newQuestion = {
            questionId: getNextQuestion._id,
            questionText: getNextQuestion.questionText,
            code: getNextQuestion.code,
            image: getNextQuestion.image,
            imageMobile: getNextQuestion.imageMobile,
            answers: getNextQuestion.answers
          };

          const updateNextQuestion = await UserQuestion.findByIdAndUpdate(
            userResult.questions[questionNumber],
            { $set: { sendToUser: true } },
            { new: true }
          );

          if (updateCurrentQuestion && updateNextQuestion) {
            questionNumber += 1;
            res.json({
              userId,
              languageTitle: userResult.languageTitle,
              result,
              questionNumber,
              allQuestionsCount: 15,
              nextQuestion: newQuestion
            });
          } else {
            res.status(400).json({
              error: "som wrong"
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

const endAnswering = (req, res) => {
  const userId = req.params.userId;

  Result.findByIdAndDelete(userId)
    .then(result => {
      if (result === null) {
        res.status(404).json({ message: "Not found" });
      }
      res.json({ message: "end answering", result });
    })
    .catch(error => res.json({ error: error }));
};

module.exports = { getResult, endAnswering };
