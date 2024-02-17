const followUserToggle = async (req, res, next) => {
  try {
    const { idUserSeQuiereSeguir } = req.params;
    const { followed } = req.user; // busco en el arrray de seguidores si le sigo o no este usuario

    if (followed.includes(idUserSeQuiereSeguir)) {
      //! si lo incluye, quiere decir lo sigo por lo que lo dejo de seguir
      try {
        // 1) como lo quiero dejar de seguir quito su id del array de los que me siguen

        await User.findByIdAndUpdate(req.user._id, {
          $pull: {
            followed: idUserSeQuiereSeguir,
          },
        });
        try {
          // 2) del user que dejo de seguir me tengo que quitar de sus seguidores

          await User.findByIdAndUpdate(idUserSeQuiereSeguir, {
            $pull: {
              followers: req.user._id,
            },
          });

          return res.status(200).json({
            action: "he dejado de seguirlo",
            authUser: await User.findById(req.user._id),
            userSeQuiereSeguir: await User.findById(idUserSeQuiereSeguir),
          });
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
    } else {
      //! si no lo tengo como que lo sigo, lo empiezo a seguir

      try {
        // 1) como lo quiero dejar de seguir quito su id del array de los que me siguen

        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            followed: idUserSeQuiereSeguir,
          },
        });
        try {
          // 2) del user que dejo de seguir me tengo que quitar de sus seguidores

          await User.findByIdAndUpdate(idUserSeQuiereSeguir, {
            $push: {
              followers: req.user._id,
            },
          });

          return res.status(200).json({
            action: "Lo empiezo a seguir de seguirlo",
            authUser: await User.findById(req.user._id),
            userSeQuiereSeguir: await User.findById(idUserSeQuiereSeguir),
          });
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
            "error catch update poner de seguidor el id que recibo por el param",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json({
      error: "error catch general",
      message: error.message,
    });
  }
};
