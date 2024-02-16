const express = require("express");
const { isAuth } = require("../../middleware/auth.middleware");
const { createRating } = require("../controllers/Rating.controllers");
const { getAll, getById } = require("../controllers/Rating.controllers");
const RatingRoutes = express.Router();

RatingRoutes.post("/create", [isAuth], createRating);
RatingRoutes.get("/getall", getAll);
RatingRoutes.get("/getbyid/:id", getById);
module.exports = RatingRoutes;
