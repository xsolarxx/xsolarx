const { isAuth, isAuthAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const {
  registerWithRedirect,
  sendCode,
  resendCode,
  checkNewUser,
  login,
  autoLogin,
  changePassword,
  sendPassword,
  modifyPassword,
  update,
  deleteUser,
  getAll,
  getById,
  toggleFavComments,
  toggleLikedCompany,
  toggleLikedNews,
  toggleLikedForum,
  toggleFollow,
  toggleFollowedForum,
  getByIdPopulate,
  getByName,
} = require("../controllers/User.controllers");
const express = require("express");
const UserRoutes = express.Router();

//! ---------------- endPoints sin auth ---------------------------------------
UserRoutes.post("/register", upload.single("image"), registerWithRedirect);
UserRoutes.post("/resend", resendCode);
UserRoutes.post("/check", checkNewUser);
UserRoutes.post("/login", login);
UserRoutes.post("/login/autologin", autoLogin);
UserRoutes.get("/getall", getAll);
UserRoutes.get("/getbyid/:id", getById);
UserRoutes.get("/getByIdPopulate/:id", getByIdPopulate);
UserRoutes.patch("/forgotpassword", changePassword);

//! ---------------- endPoints con auth ---------------------------------------

UserRoutes.delete("/:id", [isAuth], deleteUser);
UserRoutes.patch("/changepassword", [isAuth], modifyPassword);
UserRoutes.patch("/update/update", [isAuth], upload.single("image"), update);
UserRoutes.patch("/commentFav/:idComment", [isAuth], toggleFavComments);
UserRoutes.patch("/likedCompany/:idCompany", [isAuth], toggleLikedCompany);
UserRoutes.patch("/likedNews/:idNews", [isAuth], toggleLikedNews);
UserRoutes.patch("/likedForum/:idForum", [isAuth], toggleLikedForum);
UserRoutes.patch("/follow/:userToFollow", [isAuth], toggleFollow);
UserRoutes.patch("/follow/forum/:idForum", [isAuth], toggleFollowedForum);
UserRoutes.get("/byname/:name", [isAuth], getByName);

/// ------------------> rutas que pueden ser redirect
UserRoutes.get("/register/sendMail/:id", sendCode); // :id ---> es el nombre del param
UserRoutes.patch("/sendPassword/:id", sendPassword);
module.exports = UserRoutes;
