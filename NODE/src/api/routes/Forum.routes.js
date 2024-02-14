const { isAuth } = require("../../middleware/auth.middleware");
const { createForum, getById } = require("../controllers/Forum.controllers");


const ForumRoutes = require("express").Router();

ForumRoutes.post("/create",[isAuth], createForum);
ForumRoutes.get("/getbyid/:id", getById);

module.exports = ForumRoutes;
