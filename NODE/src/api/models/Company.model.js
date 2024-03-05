const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//------------------------------------------------------------------------------------------------
const CompanySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    companyType: {
      type: String,
      required: true,
    },
    companyServices: {
      type: String,
      required: true,
      enum: [
        "Installation budget",
        "Photovoltaic panel budget",
        "Energy study",
        "Maintenance",
        "Sizing and modeling of the installation",
        "Safety study",
        "Others",
      ],
    },
    image: {
      type: String,
      required: true,
    },

    ownerAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    userCompanyRatings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    userCompanyReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    userLikedCompany: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", CompanySchema);

//-------------------Exportación del modelo para su uso en otros archivos------------------------------------
module.exports = Company;

//Ok
