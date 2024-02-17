const { isAuth } = require("../../middleware/auth.middleware");
const {
  createForum,
  getById,
  deleteForum,
  update
} = require("../controllers/Forum.controllers");

const ForumRoutes = require("express").Router();

ForumRoutes.post("/create", [isAuth], createForum);
ForumRoutes.get("/getbyid/:id", getById);
ForumRoutes.delete("/:id", deleteForum);
ForumRoutes.patch("/update/:id", update);

module.exports = ForumRoutes;
