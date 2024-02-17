//----------------------------------* Middleware and utils *-------------------------------------------------
const middleware = require("../../middleware/auth.middleware");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const { generateToken } = require("../../utils/token");
const randomPassword = require("../../utils/randomPassword");
const enumOk = require("../../utils/enumOk");
const randomCode = require("../../utils/randomCode");
const sendEmail = require("../../utils/sendEmail"); //!sendEmail no ha sido llamado aún

//----------------------------------* Libraries and models*---------------------------------------------------------

const nodemailer = require("nodemailer");
const validator = require("validator");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const setError = require("../../helpers/handle-error");
const express = require("express");

const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const Comment = require("../models/Comment.model");
const Company = require("../models/Company.model");
const News = require("../models/News.model");
const Rating = require("../models/Rating.model");

dotenv.config();

//---------------------------------* REGISTER WITH REDIRECT *-------------------------------------------------------

const registerWithRedirect = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const userExist = await User.findOne(
      { email: req.body.email },
      { userName: req.body.userName }
    );
    if (!userExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const userSave = await newUser.save();
        const PORT = process.env.PORT;
        if (userSave) {
          return res.redirect(
            303,
            `http://localhost:${PORT}/api/v1/users/register/sendMail/${userSave._id}`
          );
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json("Este usuario ya existe");
    }
  } catch (error) {
    if (req.file) {
      deleteImgCloudinary(catchImg);
    }
    return next(error);
  }
};

//-------------------CONTROLADORES QUE PUEDEN SER REDIRECT-------------------------------------------

/* Se llaman por sí mismos por parte del cliente o vía redirect, como controladores de funciones accesorias */

const sendCode = async (req, res, next) => {
  try {
    //Se saca el param recibido por la ruta
    const { id } = req.params;
    // Se busca user por id para obtener -> Email y código de confirmación
    const userDB = await User.findById(id);
    const emailEnv = process.env.EMAIL; //Se envía el código
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailEnv,
        pass: password,
      },
    });

    const mailOptions = {
      from: emailEnv,
      to: userDB.email,
      subject: "Confirmation code",
      text: `Tu código es ${userDB.confirmationCode}. Muchas gracias por formar parte de nuestra plataforma. ${userDB.userName}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json({
          user: userDB,
          confirmationCode: "Error, resend code",
        });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({
        user: userDB,
        confirmationCode: userDB.confirmationCode,
      });
    });
  } catch (error) {
    return next(error);
  }
};

//------------------------------* RESEND CODE *-------------------------------------------------------------------

const resendCode = async (req, res, next) => {
  try {
    // Se configura nodemailer para el envío del código
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });

    // Se verifica 1º si el usuario existe.
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      const mailOptions = {
        from: email,
        to: req.body.email,
        subject: "Confirmation code",
        text: `tu codigo es ${userExists.confirmationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(404).json({
            resend: false,
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            resend: true,
          });
        }
      });
    } else {
      return res.status(404).json("User not found");
    }
  } catch (error) {
    return next(setError(500, error.message || "Error general send code"));
  }
};

//! ------------------------------------------------------------------------
//? -------------------------- CHECK NEW USER------------------------------
//! ------------------------------------------------------------------------

const checkNewUser = async (req, res, next) => {
  try {
    //! nos traemos de la req.body el email y codigo de confirmation
    const { email, confirmationCode } = req.body;

    const userExists = await User.findOne({ email });

    if (!userExists) {
      //!No existe----> 404 de no se encuentra
      return res.status(404).json("User not found");
    } else {
      // cogemos que comparamos que el codigo que recibimos por la req.body y el del userExists es igual
      if (confirmationCode === userExists.confirmationCode) {
        try {
          await userExists.updateOne({ check: true });

          // hacemos un testeo de que este user se ha actualizado correctamente, hacemos un findOne
          const updateUser = await User.findOne({ email });

          // este finOne nos sirve para hacer un ternario que nos diga si la propiedad vale true o false
          return res.status(200).json({
            testCheckOk: updateUser.check == true ? true : false,
          });
        } catch (error) {
          return res.status(404).json(error.message);
        }
      } else {
        try {
          /// En caso dec equivocarse con el codigo lo borramos de la base datos y lo mandamos al registro
          await User.findByIdAndDelete(userExists._id);

          // borramos la imagen
          deleteImgCloudinary(userExists.image);

          // devolvemos un 200 con el test de ver si el delete se ha hecho correctamente
          return res.status(200).json({
            userExists,
            check: false,

            // test en el runtime sobre la eliminacion de este user
            delete: (await User.findById(userExists._id))
              ? "error delete user"
              : "ok delete user",
          });
        } catch (error) {
          return res
            .status(404)
            .json(error.message || "error general delete user");
        }
      }
    }
  } catch (error) {
    // siempre en el catch devolvemos un 500 con el error general
    return next(setError(500, error.message || "General error check code"));
  }
};

//! -----------------------------------------------------------------------------
//? --------------------------------LOGIN ---------------------------------------
//! -----------------------------------------------------------------------------

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      // compara dos contraseñar una sin encryptar y otra que si lo esta
      if (bcrypt.compareSync(password, userDB.password)) {
        const token = generateToken(userDB._id, email);
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json("password dont match");
      }
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? -----------------------CONTRASEÑAS Y SUS CAMBIOS-----------------------------
//! -----------------------------------------------------------------------------

//? -----------------------------------------------------------------------------
//! ------------------CAMBIO DE CONTRASEÑA CUANDO NO ESTAS LOGADO---------------
//? -----------------------------------------------------------------------------

const changePassword = async (req, res, next) => {
  try {
    /** vamos a recibir  por el body el email y vamos a comprobar que
     * este user existe en la base de datos
     */
    const { email } = req.body;
    console.log(req.body);
    const userDb = await User.findOne({ email });
    if (userDb) {
      /// si existe hacemos el redirect
      const PORT = process.env.PORT;
      return res.redirect(
        307,
        `http://localhost:${PORT}/api/v1/users/sendPassword/${userDb._id}`
      );
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

const sendPassword = async (req, res, next) => {
  try {
    /** VAMOS A BUSCAR AL USER POOR EL ID DEL PARAM */
    const { id } = req.params;
    const userDb = await User.findById(id);
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });
    let passwordSecure = randomPassword();
    console.log(passwordSecure);
    const mailOptions = {
      from: email,
      to: userDb.email,
      subject: "-----",
      text: `User: ${userDb.userName}. Your new code login is ${passwordSecure} Hemos enviado esto porque tenemos una solicitud de cambio de contraseña, si no has sido ponte en contacto con nosotros, gracias.`,
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        /// SI HAY UN ERROR MANDO UN 404
        console.log(error);
        return res.status(404).json("dont send email and dont update user");
      } else {
        // SI NO HAY NINGUN ERROR
        console.log("Email sent: " + info.response);
        ///guardamos esta contraseña en mongo db

        /// 1 ) encriptamos la contraseña
        const newPasswordBcrypt = bcrypt.hashSync(passwordSecure, 10);

        try {
          /** este metodo te lo busca por id y luego modifica las claves que le digas
           * en este caso le decimos que en la parte dde password queremos meter
           * la contraseña hasheada
           */
          await User.findByIdAndUpdate(id, { password: newPasswordBcrypt });

          //!------------------ test --------------------------------------------
          // vuelvo a buscar el user pero ya actualizado
          const userUpdatePassword = await User.findById(id);

          // hago un compare sync ----> comparo una contraseña no encriptada con una encrptada
          /// -----> userUpdatePassword.password ----> encriptada
          /// -----> passwordSecure -----> contraseña no encriptada
          if (bcrypt.compareSync(passwordSecure, userUpdatePassword.password)) {
            // si son iguales quiere decir que el back se ha actualizado correctamente
            return res.status(200).json({
              updateUser: true,
              sendPassword: true,
            });
          } else {
            /** si no son iguales le diremos que hemos enviado el correo pero que no
             * hemos actualizado el user del back en mongo db
             */
            return res.status(404).json({
              updateUser: false,
              sendPassword: true,
            });
          }
        } catch (error) {
          return res.status(404).json(error.message);
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};
//*Antes de estar logeado es change password y modifypassword es cuando entras ya logeado y quieres cambiar la contraseña.

//--------------------------* CAMBIO DE CONTRASEÑA CUANDO YA SE ESTA ESTA LOGADO *------------------------------------------------

const modifyPassword = async (req, res, next) => {
  /** IMPORTANTE ---> REQ.USER ----> LO CREAR LOS AUTH MIDDLEWARE */
  console.log("req.user", req.user);

  try {
    const { password, newPassword } = req.body;
    const { _id } = req.user;

    /** comparamos la contrasela vieja sin encriptar y la encriptada */
    if (bcrypt.compareSync(password, req.user.password)) {
      /** tenemos que encriptar la contraseña para poder guardarla en el back mongo db */
      const newPasswordHashed = bcrypt.hashSync(newPassword, 10);

      /** vamos a actualizar la contraseña en mongo db */
      try {
        await User.findByIdAndUpdate(_id, { password: newPasswordHashed });

        /** TESTING EN TIEMPO REAL  */

        //1) Traemos el user actualizado
        const userUpdate = await User.findById(_id);

        // 2) vamos a comparar la contraseña sin encriptar y la tenemos en el back que esta encriptada
        if (bcrypt.compareSync(newPassword, userUpdate.password)) {
          /// SI SON IGUALES 200 ---> UPDATE OK
          return res.status(200).json({
            updateUser: true,
          });
        } else {
          ///NO SON IGUALES -------> 404 no son iguales
          return res.status(404).json({
            updateUser: false,
          });
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      /** si las contraseñas no son iguales le mando un 404 diciendo que las contraseñas no son iguales */
      return res.status(404).json("password dont match");
    }
  } catch (error) {
    return next(error);
    /**
     * return next(
      setError(
        500,
        error.message || 'Error general to ChangePassword with AUTH'
      )
    );
     */
  }
};

//-----------------------------------* UPDATE *-------------------------------------------------------------

const update = async (req, res, next) => {
  // capturamos la imagen nueva subida a cloudinary
  let catchImg = req.file?.path;

  try {
    // actualizamos los elementos unique del modelo
    await User.syncIndexes();

    // instanciamos un nuevo objeto del modelo de user con el req.body
    const patchUser = new User(req.body);

    // si tenemos imagen metemos a la instancia del modelo esta imagen nuevo que es lo que capturamos en catchImg
    req.file && (patchUser.image = catchImg);

    /** vamos a salvaguardar info que no quiero que el usuario pueda cambiarme */
    // AUNQUE ME PIDA CAMBIAR ESTAS CLAVES NO SE LO VOY A CAMBIAR
    patchUser._id = req.user._id;
    patchUser.password = req.user.password;
    patchUser.rol = req.user.rol;
    patchUser.confirmationCode = req.user.confirmationCode;
    patchUser.email = req.user.email;
    patchUser.check = req.user.check;

    if (req.body?.gender) {
      // lo comprobamos y lo metermos en patchUser con un ternario en caso de que sea true o false el resultado de la funcion
      const resultEnum = enumOk("enumGender", req.body?.gender);
      patchUser.gender = resultEnum.check ? req.body?.gender : req.user.gender;
    }

    try {
      /** hacemos una actualizacion NO HACER CON EL SAVE
       * le metemos en el primer valor el id de el objeto a actualizar
       * y en el segundo valor le metemos la info que queremos actualizar
       */
      await User.findByIdAndUpdate(req.user._id, patchUser);

      // si nos ha metido una imagen nueva y ya la hemos actualizado pues tenemos que borrar la antigua
      // la antigua imagen la tenemos guardada con el usuario autenticado --> req.user
      if (req.file) deleteImgCloudinary(req.user.image);

      // ++++++++++++++++++++++ TEST RUNTIME+++++++++++++++++++++++++++++++++++++++
      /** siempre lo pprimero cuando testeamos es el elemento actualizado para comparar la info que viene
       * del req.body
       */
      const updateUser = await User.findById(req.user._id);

      /** sacamos las claves del objeto del req.body para saber que info nos han pedido actualizar */
      const updateKeys = Object.keys(req.body);

      // creamos un array donde guardamos los test
      const testUpdate = [];

      // recorremos el array de la info que con el req.body nos dijeron de actualizar
      /** recordar este array lo sacamos con el Object.keys */

      // updateKeys ES UN ARRAY CON LOS NOMBRES DE LAS CLAVES = ["name", "email", "rol"]

      ///----------------> para todo lo diferente de la imagen ----------------------------------

      updateKeys.forEach((item) => {
        /** vamos a comprobar que la info actualizada sea igual que lo que me mando por el body... */
        if (updateUser[item] === req.body[item]) {
          /** aparte vamos a comprobar que esta info sea diferente a lo que ya teniamos en mongo subido antes */
          if (updateUser[item] != req.user[item]) {
            // si es diferente a lo que ya teniamos lanzamos el nombre de la clave y su valor como true en un objeto
            // este objeto see pusea en el array que creamos arriba que guarda todos los testing en el runtime
            testUpdate.push({
              [item]: true,
            });
          } else {
            // si son igual lo que pusearemos sera el mismo objeto que arrriba pro diciendo que la info es igual
            testUpdate.push({
              [item]: "sameOldInfo",
            });
          }
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });

      //--------------------------para la imagen----------------------------------
      if (req.file) {
        /** si la imagen del user actualizado es estrictamente igual a la imagen nueva que la
         * guardamos en el catchImg, mandamos un objeto con la clave image y su valor en true
         * en caso contrario mandamos esta clave con su valor en false
         */
        updateUser.image === catchImg
          ? testUpdate.push({
              image: true,
            })
          : testUpdate.push({
              image: false,
            });
      }

      /** una vez finalizado el testing en el runtime vamos a mandar el usuario actualizado y el objeto
       * con los test
       */
      return res.status(200).json({
        updateUser,
        testUpdate,
      });
    } catch (error) {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(404).json(error.message);
    }
  } catch (error) {
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

//-----------------------------------* AUTO LOGIN *-------------------------------------------------------------

const autoLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      // comparo dos contraseñas encriptadas
      if (password == userDB.password) {
        const token = generateToken(userDB._id, email);
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json("password dont match");
      }
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

//-----------------------------------* DELETE USER *-------------------------------------------------------------

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userExists = await User.findById(id);

    if (userExists) {
      await User.findByIdAndDelete(id);
      const userDelete = await User.findById(id);
      const allCommentsAllRatings = [];

      userExists.ownerRating.forEach((item) => {
        allCommentsAllRatings.push(item);
      });

      userExists.comments.forEach((item) => {
        allCommentsAllRatings.push(item);
      });
      console.log("userDelete", userDelete);
      if (!userDelete) {
        // lo que ejecutas opcion 1. req.User.image 2. userExists.image
        deleteImgCloudinary(userExists.image);
        // interaciones usuario con otros usuarios
        // tenemos que poner las claves de los modelos donde estamos quitando/borrando
        // (no en las claves del modelo de usuariio, excep`to aciones de usuario )
        try {
          await User.updateMany(
            { usersFollowed: id },
            { $pull: { usersFollowed: id } }
          );
          await User.updateMany(
            { usersFollowers: id },
            { $pull: { usersFollowers: id } }
          );
          try {
            await Comment.updateMany({ likes: id }, { $pull: { likes: id } });
            try {
              await Company.updateMany(
                { userLikedCompany: id },
                { $pull: { userLikedCompany: id } }
              );
              try {
                await News.updateMany({ likes: id }, { $pull: { likes: id } });
                try {
                  await Forum.updateMany(
                    { likes: id },
                    { $pull: { likes: id } }
                  );
                  await Forum.updateMany(
                    { followed: id },
                    { $pull: { followed: id } }
                  );
                  try {
                    // borrar todos los rating que es su userPunctuation tenga en id del user borrado
                    await Rating.deleteMany({ userPunctuation: id });
                    try {
                      // borramos comentarios
                      await Comment.deleteMany({ owner: id });
                      Promise.all(
                        allCommentsAllRatings.map(async (idElement) => {
                          await Company.updateOne(
                            { userCompanyRatings: idElement },
                            {
                              $pull: { userCompanyRatings: idElement },
                            }
                          );
                          await Company.updateOne(
                            {
                              userCompanyReviews: idElement,
                            },
                            {
                              $pull: { userCompanyReviews: idElement },
                            }
                          );
                          await Forum.updateOne(
                            {
                              comments: idElement,
                            },
                            {
                              $pull: { comments: idElement },
                            }
                          );
                          await News.updateOne(
                            {
                              comments: idElement,
                            },
                            {
                              $pull: { comments: idElement },
                            }
                          );
                          await User.updateMany(
                            {
                              favComments: idElement,
                            },
                            {
                              $pull: { favComments: idElement },
                            }
                          );
                        })
                      ).then(async () => {
                        console.log("entro");
                        // si sale bien la promesa
                        return res.status(200).json("user borrado");
                      });
                    } catch (error) {
                      return res.status(404).json({
                        error: "Error al borrar comentarios",
                        message: error.message,
                      });
                    }
                  } catch (error) {
                    return res.status(404).json({
                      error: "Error al borrar rating",
                      message: error.message,
                    });
                  }
                } catch (error) {
                  return res.status(404).json({
                    error: "Error al actualizar like y seguidores del Foro",
                    message: error.message,
                  });
                }
              } catch (error) {
                return res.status(404).json({
                  error: "Error al  actualizar like de la noticia",
                  message: error.message,
                });
              }
            } catch (error) {
              return res.status(404).json({
                error: "Error al actualizar like de la compañia  ",
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: "Error al actualizar like del comentario",
              message: error.message,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "Error al actualizar followed y followers del usuario",
            message: error.message,
          });
        }
      } else {
        return res.status(404).json({
          error: "Error al borrar usuario",
        });
      }
    } else {
      return res.status(404).json({
        error: "Usuario no existe",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  }
};

//-------------------------------*GET BY ID*-------------------------------------------------------------

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id);
    if (userById) {
      return res.status(200).json(userById);
    } else {
      return res.status(404).json("no se ha encontrado el comentario");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//--------------------------------*GET ALL*-------------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allUser = await User.find().populate(
      "forumOwner comments newsOwnerAdmin"
    );
    /** el find nos devuelve un array */
    if (allUser.length > 0) {
      return res.status(200).json(allUser);
    } else {
      return res.status(404).json("no se han encontrado los usuarios");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//--------------------------------*TOGGLE LIKED COMMENTS*-------------------------------------------------------------
//? QUEDA PENDIENTE CAMBIAR TODOS LOS FAVCOMMENTS A likedComments

// User campo de favcomments, ponendo el id del comentario
// comentario en su campo de likes poner id de usuaruio
// comprovar si el campo de favcoment inclui el id del comentario
//con pull user o push para saber si tienes o no
const toggleFavComments = async (req, res, next) => {
  try {
    const { idComment } = req.params;
    const { _id, favComments } = req.user;
    if (favComments.includes(idComment)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { favComments: idComment },
        });
        await Comment.findByIdAndUpdate(idComment, {
          $pull: { likes: _id },
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("favComments"),
          comment: await Comment.findById(idComment).populate("likes"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar el like",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { favComments: idComment },
        });
        await Comment.findByIdAndUpdate(idComment, {
          $push: { likes: _id },
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("favComments"),
          comment: await Comment.findById(idComment).populate("likes"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar el like del usuario",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  }
};

//--------------------------------* TOOGLE LIKED COMPANY *-------------------------------------------------------------

const toggleLikedCompany = async (req, res, next) => {
  try {
    const { idCompany } = req.params; // id de la company
    const { _id, likedCompany } = req.user; // usuario y company
    // una condicional con includes
    if (likedCompany.includes(idCompany)) {
      console.log("liked company includes company ID");
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { likedCompany: idCompany }, // relacionar con la clave en model USER con idCompany
        });
        await Company.findByIdAndUpdate(idCompany, {
          $pull: { userLikedCompany: _id }, // relacionar con la clave en model Company con Id user
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("likedCompany"),
          company: await Company.findById(idCompany).populate(
            "userLikedCompany"
          ),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar el like a la compañía",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { likedCompany: idCompany }, // relacionar con la clave en model USER con idCompany
        });
        await Company.findByIdAndUpdate(idCompany, {
          $push: { userLikedCompany: _id }, // relacionar con la clave en model Company con Id user
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("likedCompany"),
          company: await Company.findById(idCompany).populate(
            "userLikedCompany"
          ),
        });
      } catch (error) {
        return res.status(404).json(error.message);
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  }
};

//---------------------------------* TOOGLE LIKED NEWS *-------------------------------------------------------------

const toggleLikedNews = async (req, res, next) => {
  try {
    const { idNews } = req.params;
    const { _id, likedNews } = req.user;
    if (likedNews.includes(idNews)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { likedNews: idNews },
        });
        await News.findByIdAndUpdate(idNews, {
          $pull: { likes: _id },
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("likedNews"),
          news: await News.findById(idNews).populate("likes"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar el like de la noticia",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { likedNews: idNews },
        });
        await News.findByIdAndUpdate(idNews, {
          $push: { likes: _id },
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("likedNews"),
          news: await News.findById(idNews).populate("likes"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar el like de la noticia",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  }
};

//-------------------------------* TOOGLE LIKED FORUM *-------------------------------------------------------------

const toggleLikedForum = async (req, res, next) => {
  try {
    const { idForum } = req.params;
    const { _id, likedForum } = req.user;
    if (likedForum.includes(idForum)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { likedForum: idForum },
        });
        await Forum.findByIdAndUpdate(idForum, {
          $pull: { likes: _id },
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("likedForum"),
          forum: await Forum.findById(idForum).populate("likes"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar el like del foro",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { likedForum: idForum },
        });
        await Forum.findByIdAndUpdate(idForum, {
          $push: { likes: _id },
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("likedForum"),
          forum: await Forum.findById(idForum).populate("likes"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar el like del foro",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  }
};

//------------------------------------* TOGGLE USERS FOLLOWED *-------------------------------------------------------------

//? EN PROCESO, MUY HARDCORE TT__TT
/* PISTA: Request tiene que tener :
UserID is triggering the follow action
UserID of the user who the aforementioned user is FOLLOWING
Option a: Toggle function which does two actions:
 MAIN TOGGLE FUNCTION CAN RUN BOTH THE BELOW
 THE MAIN FUNTION IS THE ONE WHICH WILL BE TRIGGERED FROM THE ROUTE
 runs togglerUsersFollowers
 runs toggleUsersFollowed */
/*
Cuando un user sigue a otro user se tiene que hacer:

1º El user que hace follow -> Añade a su perfil que está siguiendo a ese user
2º El user que ha recibido el follow, que está siendo seguido -> 
Se le añade en su perfil que "x user le está siguiendo" */
/*
const toggleUsersFollowed = async (req, res, next) => {
  try {
    const { idUserToFollow } = req.params; // Id de user que voy a seguir
    const { _id, usersFollowed, } = req.user; // Del req.user nos referimos a los user que "yo" ya sigo

    // Se requiere el id, los users que "me" siguen y los que "yo" sigo
    // una condicional con includes
    if (usersFollowed.includes(idUserToFollow)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { usersFollowed: idUserToFollow },
        }); /* Se llama al User model, se realiza una búsqueda por id y se extraen de los users que
         "yo" sigo, sus ids, los cuales serán necesitados 
        return res.status(200).json({
          user: await User.findById(_id).populate("usersFollowed"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar a los users que yo sigo",
          message: error.message,
        });
      }
    } else if (!usersFollowed.includes(idUserToFollow)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { usersFollowed: idUserToFollow },
        });
        return res.status(200).json({
          user: await User.findById(_id).populate("usersFollowed"),
        });
      } catch (error) {
        return res.status(404).json({
          error: "Error al actualizar los users que yo sigo",
          message: error.message,
        });
      }
    }

    const userToFollow = await User.findById(idUserToFollow);

    // Hay que actualizar el user que está siendo seguido con su nuevo follower
    // 1º  read the information for user iduserToFollow
    // Get "usersFollowers" for iduserToFollow
    // Check if "usersFollowed" for the above contains _id (the user who has followed it)
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  } // Error 500 cogerá un error que los catches previos no han cogido
};  */
//-------------------------------------------------------------------------------------------------------------------------
//! error al testar insonmia .... 3h da mañana realmente es dificile
const toggleFollow = async (req, res, next) => {
  try {
    const { userToFollow } = req.params; // usuario a seguir o dejar de seguir
    const { usersFollowed } = req.user; // usuario que quiere seguir
    //como lo quiero dejar de seguir quito su id del array de los que me siguen
    if (!usersFollowed) {
      return res.status(401).json({
        error: "Não autorizado",
        message: "Você não está autenticado.",
      });
    }
    if (usersFollowed.includes(userToFollow)) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { usersFollowed: userToFollow },
        });
        //del user que dejo de seguir me tengo que quitar de sus seguidores
        try {
          await User.findByIdAndUpdate(userToFollow, {
            $pull: { usersFollowers: req.user._id },
          });
          return res.status(200).json("he dejado de seguirlo");
        } catch (error) {
          return res.status(404).json({
            error:
              "error catch update quien le sigue al user que recibo por el param",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error:
            "error catch update borrar de seguidor el id que recibo por el param",
          message: error.message,
        });
      }
      // si no lo tengo como que lo sigo, lo empiezo a seguir
    } else {
      //como lo quiero dejar de seguir quito su id del array de los que me siguen
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { usersFollowed: userToFollow },
        });
        try {
          await User.findByIdAndUpdate(userToFollow, {
            $push: { usersFollowers: req.user._id },
          });
        } catch (error) {
          return res.status(200).json("Lo empiezo a seguir");
        }
      } catch (error) {
        return res.status(404).json({
          error:
            "error catch update quien le sigue al user que recibo por el param",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  }
};

//-------------------------------------------------------------------------------------------------------------------------

module.exports = {
  sendCode,
  registerWithRedirect,
  resendCode,
  checkNewUser,
  login,
  autoLogin,
  changePassword,
  sendPassword,
  modifyPassword,
  update,
  deleteUser,
  getById,
  getAll,
  toggleFavComments,
  toggleLikedCompany,
  toggleLikedNews,
  toggleLikedForum,
  toggleFollow,
};
