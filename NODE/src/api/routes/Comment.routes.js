const { isAuth } = require("../../middleware/auth.middleware");
const {
  createComment,
  deleteComment,
  getAll,
  getById,
  update,
  getByRecipient,
} = require("../controllers/Comment.controllers");

const CommentRoutes = require("express").Router();

CommentRoutes.post("/create/:idRecipient", [isAuth], createComment);
CommentRoutes.delete("/comments/:idComment", [isAuth], deleteComment);
CommentRoutes.get("/getall", getAll);
CommentRoutes.get("/getbyid/:id", getById);
CommentRoutes.patch("/update/:id", [isAuth], update);
CommentRoutes.get("/:recipientType/:id", getByRecipient);

module.exports = CommentRoutes;
