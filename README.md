## BACKEND REPO XSOLARX

Este repositorio contiene el código del backend de xsolarx, un proyecto desarrollado como parte de un bootcamp. Para empezar a explorar y trabajar con la aplicación localmente, sigue los pasos que se detallan a continuación:

**IMPORTANTE:** Recuerda iniciar el backend y mantenerlo en ejecución para que el frontend funcione correctamente. Además, asegúrate de tener el archivo `.env` presente en el proyecto. Si no lo tienes, ponte en contacto con algún miembro del equipo o consulta en Notion.

Sigue las instrucciones a continuación para configurar el entorno de desarrollo:

1. Clona el repositorio:

   ```bash
   git clone https://github.com/xsolarxx/xsolarx.git
   ```

2. Instala las dependencias:

   ```bash
   npm i
   ```

   **Nota:** No es necesario forzar la instalación (`npm install --force`), ya que se ha corregido la discrepancia en las versiones que existía entre `coludunary` y `multer`.

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   **Nota:** Se ha movido la carpeta 'src' junto al resto del contenido dentro de la carpeta 'NODE', para dejar la arquitectura más limpia y evitar problemas con el comando 'npm run dev'.

Si todo se realiza correctamente, verás algo similar a esto en la terminal:

```bash

> xsolarx@1.0.0 dev
> nodemon index.js

[nodemon] 3.1.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`
Server listening on port 👌🔍 http://localhost:8081
Conectada la DB 👌  en el host: ac-qbomu60-shard-00-00.r1lyiuc.mongodb.net con el nombre: test

```
