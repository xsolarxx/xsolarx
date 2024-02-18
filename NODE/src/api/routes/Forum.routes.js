const { isAuth } = require("../../middleware/auth.middleware");

const {
  createForum,
  getById,
  deleteForum,
  update,
  getAll
} = require("../controllers/Forum.controllers");
const { upload } = require("../../middleware/files.middleware");
const ForumRoutes = require("express").Router();

ForumRoutes.post("/create", [isAuth], upload.single("image"), createForum);
ForumRoutes.get("/getbyid/:id", getById);
ForumRoutes.delete("/:id", deleteForum);
ForumRoutes.patch("/update/:id", update);
ForumRoutes.get("/getAll", getAll);

module.exports = ForumRoutes;

//Ok
