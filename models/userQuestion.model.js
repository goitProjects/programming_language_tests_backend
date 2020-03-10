const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserQuestionSchema = new Schema(
  {
    languageId: {
      type: Schema.Types.ObjectId,
      ref: "Languages"
    },
    questionText: {
      type: String,
      trim: true
    },
    image: {
      type: String
    },
    imageMobile: {
      type: String
    },
    code: {
      type: Object,
      markup: {
        type: String
      },
      language: {
        type: String
      }
    },
    answers: [
      {
        answerNumber: {
          type: Number,
          required: true
        },
        answerText: {
          type: String,
          required: true
        }
      }
    ],
    rightAnswer: {
      type: Number,
      required: true
    },
    explanation: {
      type: String
    },
    userAnswer: {
      type: Number,
      default: 0
    },
    sendToUser: {
      type: Boolean,
      default: false
    },
    userAnswerCorrectly: {
      type: Boolean
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Results"
    },
    questionNumberCounter: {
      type: Number
    },
    lastQuestionSended: {
      type: Boolean,
      default: false
    },
    languageTitle: {
      type: String
    }
  },
  { timestamps: true }
);

const UserQuestion = mongoose.model("UserQuestion", UserQuestionSchema);

module.exports = UserQuestion;
