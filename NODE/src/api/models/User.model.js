const bcrypt = require("bcrypt"); // para encryptar informacion
const validator = require("validator"); /// n os sirve para validad info
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nickName: {
      type: String,
      required:false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Email not valid"], // en caso de no ser un email valido
      // lanza el error ----> 'Email not valid'
    },
    gender: {
      type: String,
      enum: ["hombre", "mujer", "otros"],
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
      validate: [validator.isStrongPassword], //minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    },
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

    usersFollowed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    usersFollowers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favCompany: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
    favNews: [{ type: mongoose.Schema.Types.ObjectId, ref: "News" }],
    forumOwner: [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }], // foros que yo he creado
    forumFollowing:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }], // foros que yo sigo
    valuedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // reviews a las complañias
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // comentarios a los foros y a las noticios
    newsOwnerAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "News" }, // news que el admin ha creado

  },
  {
    timestamps: true, //Refleja el momento exacto de la modificación
  }
);

UserSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
    // el next puede lanzar al log o puede decir que continuemos
  } catch (error) {
    next("Error hashing password", error);
  }
});
const User = mongoose.model("User", UserSchema);
module.exports = User;
