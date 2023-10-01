import categorias from "./categorias.js";
import precios from "./precios.js";
import { Categoria, Precio, Usuario } from "../models/Index.js";
import db from "../config/db.js";
import { exit } from "node:process";
import usuario from './usuarios.js';

async function importarDatos() {
  try {
    //  Autenticar
    await db.authenticate();

    //  Generar las columnas
    await db.sync();

    //  Insertamos los datos
    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios),
      Usuario.bulkCreate(usuario)
    ]);

    console.log("Datos Importados correctamente");
    exit(0);
  } catch (error) {
    console.log(error);
    exit(1);
  }
}
async function eliminarDatos() {
  try {
    // await Promise.all([
    //   Categoria.destroy({ where: {}, truncate: true }),
    //   Precio.destroy({ where: {}, truncate: true }),
    // ]);
    await db.sync({ force: true });

    console.log("Datos eliminados correctamente");
    exit(0);
  } catch (error) {
    console.log(error);
    exit(1);
  }
}

if (process.argv[2] === "-i") {
  // SCRIPT db:importar PARA CREAR TODA LA INFO A LA BASE DE DATOS
  importarDatos();
}
if (process.argv[2] === "-e") {
  // SCRIPT db:importar PARA CREAR TODA LA INFO A LA BASE DE DATOS
  eliminarDatos();
}
