const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//--------------------------------------------------------------------------------------

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nickName: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Email not valid"],
      // Si el email no es válido, se lanzará el error ----> "Email not valid"
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    rol: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isStrongPassword],
    }, //minLength:8, minLowercase:1, minUppercase:1, minNumbers:1, minSymbols:1
    image: {
      type: String,
    },
    confirmationCode: {
      type: Number,
      required: true,
    },
    check: {
      type: Boolean,
      default: false,
    },

    favComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Comentarios en los que el user ha dado "like"
    ownerRating: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }], // User que puntúa a una compañía
    usersFollowed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users que el usuario en particular sigue
    usersFollowers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Seguidores del usuario en particular
    likedCompany: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }], // Compañía que ha sido gustada
    likedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: "News" }], // Noticia que ha sido gustada
    likedForum: [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }], // Foro que ha sido gustado
    forumOwner: [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }], // Foro que el user crea
    forumFollowing: [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }], // Foro que el user sigue
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Comentarios que van a News,Forum o Company
    newsOwnerAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "News" }], // El creador de la noticia(admin)
    companyOwnerAdmin: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    ], // El creador de la compañía(admin)
    companyPunctuated: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    ], // Compañía que recibe una puntuación
    blockedByApp: { type: Boolean, default: false },
  },
  { timestamps: true } //Refleja el momento exacto de la modificación
);

UserSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next("Error hashing password", error);
  }
});
const User = mongoose.model("User", UserSchema);

//-------------------Exportación del modelo para su uso en otros archivos------------------------------------
module.exports = User;

// Ok
