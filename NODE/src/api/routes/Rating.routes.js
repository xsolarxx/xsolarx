const { isAuth } = require("../../middleware/auth.middleware");

const {
  createRating,
  getAll,
  getById,
  update,
} = require("../controllers/Rating.controllers");

const RatingRoutes = require("express").Router();

RatingRoutes.post("/create", [isAuth], createRating);
RatingRoutes.get("/getall", getAll);
RatingRoutes.get("/getbyid/:id", getById);
RatingRoutes.patch("/update/:id", [isAuth], update);

module.exports = RatingRoutes;

//Ok
