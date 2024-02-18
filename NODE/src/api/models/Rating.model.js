const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//--------------------------------------------------------------------------------------------

const RatingSchema = new Schema(
  {
    // El rating en tipo estrella que el user le da a la compañía
    punctuation: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    }, // La puntuación que da el user a la compañía
    userPunctuation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // La compañía que ha sido puntuada por el user
    companyPunctuated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", RatingSchema);

//-----------------------------------------------------------------------------------------------
module.exports = Rating;

// Ok
