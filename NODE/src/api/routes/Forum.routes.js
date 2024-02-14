const { createForum, getById } = require("../controllers/Forum.controllers");

const ForumRoutes = require("express").Router();

ForumRoutes.post("/create", createForum);
ForumRoutes.get("/getbyid/:id", getById);

module.exports = ForumRoutes;
