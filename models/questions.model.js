const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const random = require("mongoose-simple-random");

const QuestionsSchema = new Schema({
  languageId: {
    type: Schema.Types.ObjectId,
    ref: "Languages"
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String
  },
  imageMobile: {
    type: String
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
  code: {
    type: Object,
    markup: {
      type: String
    },
    language: {
      type: String
    }
  },
  rightAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String
  }
});

QuestionsSchema.plugin(random);

const Questions = mongoose.model("Questions", QuestionsSchema);

module.exports = Questions;
