const Languages = require("../models/language.model");
const Questions = require("../models/questions.model");
const Results = require("../models/results.model");
const UserQuestion = require("../models/userQuestion.model");

const getLanguages = (req, res) => {
  Languages.find({})
    .then(result => {
      res.json({
        languages: result.map(language => {
          const pullQuestions = language.questions.length;
          const countQuestions = pullQuestions > 15 ? 15 : pullQuestions;
          return {
            languageId: language._id,
            title: language.title,
            image: language.image,
            description: language.description,
            pullQuestions,
            countQuestions,
            createdAt: language.createdAt,
            updatedAt: language.updatedAt
          };
        })
      });
    })
    .catch(err => res.json({ error: err }));
};

const start = async (req, res) => {
  const languageId = req.params.languageId;

  try {
    // TODO
    //? - create new Document
    //! - get Question by languageId from Question collection random 15
    //? - getting 25 question write in UserQuestion collection return Document get ID's and write to user new doc
    //! - Get one question and send to Client

    const questionByLanguageId = await Questions.find({
      languageId: languageId
    });

    console.log("find all questions by language ID");

    if (questionByLanguageId === null) {
      res
        .status(404)
        .json({ message: "Not found question by this language ss" })
        .end();
    } else {
      Questions.findRandom(
        { languageId: languageId },
        {},
        { limit: 15 },
        async (err, randomQuestions) => {
          if (err) {
            res
              .status(404)
              .json({ error: err, message: err.message })
              .end();
          }
          const languageTitle = await Languages.findById(languageId);

          const newUser = await new Results({
            languageId: languageId,
            languageTitle: await languageTitle.title,
            questionNumber: 1,
            allQuestionsCount: 15
          });

          let questionNumberCounter = 0;

          const insertUserQuestions = await UserQuestion.insertMany(
            await randomQuestions.map(question => {
              questionNumberCounter = questionNumberCounter + 1;

              return {
                questionNumberCounter: questionNumberCounter,
                userId: newUser._id,
                code: question.code,
                languageId: question.languageId,
                questionText: question.questionText,
                image: question.image,
                imageMobile: question.imageMobile,
                answers: question.answers,
                languageTitle: languageTitle.title,
                rightAnswer: question.rightAnswer,
                explanation: question.explanation
              };
            })
          );

          newUser.questions = await insertUserQuestions.map(
            question => question._id
          );

          newUser.languageTitle = await languageTitle.title;

          newUser
            .save()
            .then(async doc => {
              console.log(doc);
              const getFirstQuestion = await UserQuestion.findOneAndUpdate(
                { userId: doc._id, questionNumberCounter: 1 },
                { $set: { sendToUser: true } },
                { new: true }
              );

              res.json({
                userId: doc._id,
                languageTitle: doc.languageTitle,
                question: {
                  questionId: getFirstQuestion._id,
                  questionText: getFirstQuestion.questionText,
                  image: getFirstQuestion.image,
                  imageMobile: getFirstQuestion.imageMobile,
                  answers: getFirstQuestion.answers
                },
                questionNumber: 1,
                allQuestionsCount: 15
              });
            })
            .catch(error =>
              res
                .status(404)
                .json({ error: error, message: error.message })
                .end()
            );
        }
      );
      // const lengthForAddingQuestions = 15;

      // // ?questionByLanguageId.length <= 15 ? questionByLanguageId.length : 25;

      // for (let i = 1; i <= lengthForAddingQuestions; i++) {
      //   getSomeQuestions.push(
      //     questionByLanguageId[
      //       Math.floor(Math.random() * questionByLanguageId.length) + 1
      //     ]
      //   );
      // }
    }
  } catch (error) {
    res
      .status(404)
      .json({ error: error, message: "Server error" })
      .end();
  }
};

const getQuestionsByLanguageId = (req, res) => {
  const languageId = req.params.languageId;

  Questions.find({ languageId })
    .then(result => {
      res.json({ languages: result });
    })
    .catch(err => res.json({ error: err }));
};

const getQuestions = (req, res) => {
  Questions.find()
    .then(result => {
      res.json({ languages: result });
    })
    .catch(err => res.json({ error: err }));
};

const newLanguage = (req, res) => {
  const data = req.body;

  const newLanguage = new Languages(data);

  newLanguage.save((err, result) => {
    if (err) {
      res.json({ error: err }).end();
    }
    res.json({ language: result }).end();
  });
};

const updateLanguage = (req, res) => {
  const id = req.params.languageId;
  const updatedData = req.body;
  Languages.findByIdAndUpdate(id, updatedData, { new: true })
    .then(result => {
      res.json({ language: result });
    })
    .catch(err => res.json({ error: err }));
};
const deleteLanguage = (req, res) => {
  const id = req.params.languageId;
  Languages.findByIdAndDelete(id)
    .then(result => {
      res.json({ language: result });
    })
    .catch(err => res.json({ error: err }));
};

const newQuestion = (req, res) => {
  const languageId = req.params.languageId;
  const data = req.body;
  data.languageId = languageId;

  const newQuestion = new Questions(data);

  Languages.findByIdAndUpdate(languageId, {
    $push: { questions: newQuestion._id }
  })
    .then(result => {
      if (result) {
        newQuestion
          .save()
          .then(resultNewQuestion => {
            res.json({ question: resultNewQuestion, language: result });
          })
          .catch(err => res.json({ error: err }));
      }
    })
    .catch(err => res.json({ error: err }));
};

const updateQuestion = (req, res) => {
  const id = req.params.questionId;
  const updatedData = req.body;
  Questions.findByIdAndUpdate(id, updatedData, { new: true })
    .then(result => {
      res.json({ question: result });
    })
    .catch(err => res.json({ error: err }));
};

const deleteQuestion = (req, res) => {
  const id = req.params.questionId;
  Questions.findByIdAndDelete(id)
    .then(result => {
      res.json({ question: result });
    })
    .catch(err => res.json({ error: err }));
};

const cancelAnswering = async (req, res) => {
  const userId = req.params.userId;

  const getAllUserAnsweringQuestion = await Results.findById(userId).populate(
    "questions"
  );

  const lengthTrulyAnswered = await getAllUserAnsweringQuestion.questions.filter(
    question => question.userAnswerCorrectly
  ).length;

  //TODO
  //? - вирахувати проценти відповідей
  //? - відповідно до проценту взяти текст
  const getTrulyAnsweredInPercentage = (lengthTrulyAnswered / 5) * 100;

  res.json({
    finalResult: true,
    allQuestionsCount: 5,
    rightAnswered: lengthTrulyAnswered,
    rightAnsweredInPercentage: getTrulyAnsweredInPercentage,
    languageTitle: getAllUserAnsweringQuestion.languageTitle,
    questions: getAllUserAnsweringQuestion.questions.map(question => ({
      questionId: question._id,
      questionTitle: question.questionTitle,
      image: question.image,
      answers: question.answers,
      questionExplanation: question.explanation,
      userAnswerCorrectly: question.userAnswerCorrectly,
      rightAnswer: question.rightAnswer
    })),
    timeStartAnswering: getAllUserAnsweringQuestion.createAt
  });
};

module.exports = {
  getQuestions,
  getQuestionsByLanguageId,
  getLanguages,
  newLanguage,
  updateLanguage,
  deleteLanguage,
  deleteQuestion,
  updateQuestion,
  newQuestion,
  start,
  cancelAnswering
};
