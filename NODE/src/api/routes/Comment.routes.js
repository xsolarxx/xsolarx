const {
    createComment,
    deleteComment,
    getAll,
  } = require("../controllers/Comment.controllers");
  
  const CommentRoutes = require("express").Router();
  
  CommentRoutes.post("/create", createComment);
  CommentRoutes.delete("/:id",deleteComment);
  CommentRoutes.get("/getall",getAll);
  module.exports = CommentRoutes;