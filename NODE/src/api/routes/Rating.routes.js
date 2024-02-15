const express = require("express");
const { isAuth } = require("../../middleware/auth.middleware");
const { createRating } = require("../controllers/Rating.controllers");
const RatingRoutes = express.Router();

RatingRoutes.post("/create", [isAuth], createRating)
module.exports = RatingRoutes;