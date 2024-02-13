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
      required: true,
      unique: true,
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
    picProfile: {
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
    valuedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
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
