import { validationResult } from "express-validator";
import { Precio, Categoria, Propiedad } from "../models/Index.js";

const admin = async (req, res) => {
  const { id } = req.usuario;

  const propiedades = await Propiedad.findAll({
    where: {
      usuarioId: id,
    },
    include: [
      {model: Categoria, as: 'categoria'},
      {model: Precio, as: 'precio'}
    ]
  });

  res.render("propiedades/admin", {
    pagina: "Mis Propiedades",
    propiedades: propiedades,
  });
};
//  Formulario para crear una nueva propiedad
const crear = async (req, res) => {
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: {},
  });
};

const guardar = async (req, res) => {
  //  Validacion
  let resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);
    return res.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body,
    });
  }
  //  Crea un Registro
  const {
    titulo,
    descripcion,
    habitaciones,
    estacionamiento,
    baños,
    calle,
    lat,
    lng,
    precio: precioId,
    categoria: categoriaId,
  } = req.body;

  const { id: usuarioId } = req.usuario;

  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      descripcion,
      baños,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
      usuarioId,
      imagen: "",
    });
    const { id } = propiedadGuardada;
    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
};

const agregarImagen = async (req, res) => {
  const { id } = req.params; //con params podemos ver la informacion en la url
  // VALIDAR QUE LA PROPIEDAD EXISTA
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // VALIDAR QUE LA PROPIEDAD NO ESTE PUBLICADA
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }
  // VALIDAR QUE LA PROPIEDAD PERTENECE AL USUARIO
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/agregar-imagen", {
    pagina: `Agregar Imagen: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    propiedad,
  });
};

const almacenarImagen = async (req, res, next) => {
  const { id } = req.params; //con params podemos ver la informacion en la url

  // VALIDAR QUE LA PROPIEDAD EXISTA
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // VALIDAR QUE LA PROPIEDAD NO ESTE PUBLICADA
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }
  // VALIDAR QUE LA PROPIEDAD PERTENECE AL USUARIO
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }
  try {
    // console.log(req.file);
    // ALMACENAR LA IMAGEN Y PUBLICAR PROPIEDAD
    propiedad.imagen = req.file.filename;
    propiedad.publicado = 1;

    await propiedad.save();

    next();
  } catch (error) {
    console.log(error);
  }
};

export { admin, crear, guardar, agregarImagen, almacenarImagen };
