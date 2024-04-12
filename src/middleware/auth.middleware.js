const User = require("../api/models/User.model");
const { verifyToken } = require("../utils/token");
const dotenv = require("dotenv");
dotenv.config();

const isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    /// solo se crea req.user cuando es un endpoint authenticado ---> tiene como middleware el auth
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(error);
  }
};

const isAuthAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    // cuando decodifico el token saco el id y el email
    console.log(decoded);
    req.user = await User.findById(decoded.id);

    // pongo un requisito mas y es que sea admin
    if (req.user.rol !== "admin") {
      return next(new Error("Unauthorized, not admin"));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  isAuth,
  isAuthAdmin,
};
