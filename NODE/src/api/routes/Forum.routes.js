const { createForum } = require("../controllers/Forum.controllers");

const ForumRoutes = require("express").Router();

ForumRoutes.post("/create", createForum);

module.exports = ForumRoutes;
