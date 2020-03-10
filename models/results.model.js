const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResultsSchema = new Schema(
  {
    userIP: String,
    userLocation: String,
    languageTitle: { type: String },
    languageId: {
      type: Schema.Types.ObjectId,
      ref: "Languages"
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserQuestion"
      }
    ]
  },
  { timestamps: true }
);

const Results = mongoose.model("Results", ResultsSchema);

module.exports = Results;
