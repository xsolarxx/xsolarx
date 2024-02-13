const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
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
  },
  image: {
    type: String,
    required: true,
  },
  userCompanyRatings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userCompanyReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userfavCompany: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Create Company model
const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
