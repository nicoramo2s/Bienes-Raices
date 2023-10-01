import multer from "multer";
import path from "path";
import { generarId } from "../helpers/tokens.js";

//* Configuración de multer
const storage = multer.diskStorage({
  //? Carpeta donde se guardan los archivos
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  //? Nombre del archivo
  filename: function (req, file, cb) {
    /**
     * Se generaId para evitar duplicidad en el nombre de la imagen
     * extname - extrae la extensión del archivo para concatenarlo al nombre de la imagen
     */
    if (file) {
      cb(null, generarId() + path.extname(file.originalname));
    }
  },
});

//* Pasando la configuración
const upload = multer({ storage: storage });
// const upload = multer({ dest: 'public/a' })

export default upload;
