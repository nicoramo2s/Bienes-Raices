import Propiedad from "./Propiedad.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import Usuario from "./Usuario.js";

// Precio.hasOne(Propiedad); //PRECIO PARA UNA PROPIEDAD
Propiedad.belongsTo(Precio); //PRECIO PARA UNA PROPIEDAD
Propiedad.belongsTo(Categoria); //CATEGORIA PARA UNA PROPIEDAD
Propiedad.belongsTo(Usuario); //UNA PROPIEDD VA A TENER UN USUARIO

export { Precio, Categoria, Propiedad, Usuario };
