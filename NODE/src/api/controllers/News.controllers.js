const createNews = async (req, res, next) => {
    try {
      // Verificar si el usuario tiene el rol de administrador
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acceso denegado. Solo los administradores pueden crear noticias.',
        });
      }
      // Hacemos una instancia del modelo
      const customBody = {
        title: req.body?.title,
        content: req.body?.content,
        date: new Date(),
        // Puedes manejar la imagen según tus necesidades, ya sea como una URL o guardándola en la base de datos.
        image: req.body?.image,
      };
      // Se Crea una nueva instancia de la noticia
      const newNews = new News(customBody);
      const savedNews = await newNews.save();
      return res
        .status(savedNews ? 200 : 404)
        .json(savedNews ? savedNews : "Error al crear la noticia");
    } catch (error) {
      return res.status(500).json({
        error: "Error al crear la noticia",
        message: error.message,
      });
    }
  };