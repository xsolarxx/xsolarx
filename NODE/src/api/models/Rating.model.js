const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const RatingSchema = new Schema({
  punctuation: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  }, // el rating en tipo estrella para la compañía
  userPunctuation:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
   // la puntuación que da el User a la compañía
  companyPunctuated: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    }, // hace referencia a la compañía que ha sido puntuada por el User
  ],
}, 
{timestamps: true});

// Create Company model
const Rating = mongoose.model("Rating", RatingSchema);
module.exports = Rating;
