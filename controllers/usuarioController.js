import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";
import bcrypt from "bcrypt";

/** LOGIN */
const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar Sesion",
    csrfToken: req.csrfToken(),
  });
};

const autenticar = async (req, res) => {
  //VALIDACION
  await check("email")
    .isEmail()
    .withMessage("Email valido obligatorio")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("Contraseña obligatoria o Incorrecta")
    .run(req);

  let resultado = validationResult(req);
  //Verificar que el usuario este vacio
  if (!resultado.isEmpty()) {
    //Errores
    return res.render("auth/login", {
      pagina: "Inicia Sesion",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }
  const { email, password } = req.body; //EXTRAE LOS VALORES DE EL FORMULARIO ATRAVEZ DE "name"

  //COMPROBAR SI EL USUARIO EXISTE
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Inicia Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El Usuario no existe" }],
    });
  }
  //COMPROBAR SI EL USUARIO ESTA CONFIRMADO
  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Inicia Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Tu cuenta no esta Confirmada" }],
    });
  }
  //COMPROBAR SI EL PASSWORD ES CORRECTO
  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Inicia Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "La es Contraseña incorrecta" }],
    });
  }
  //AUTENTICAR AL USUARIO
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });
  console.log(token);
  // Almacenar token en una cookie
  return res
    .cookie("_token", token, {
      httpOnly: true,
      // secure: true
    })
    .redirect("/mis-propiedades");
};
/** FIN LOGIN */

/** REGISTRO */
const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};
//Validacion del formulario de registro
const registrar = async (req, res) => {
  //Validacion
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("Email valido obligatorio")
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("Contraseña obligatoria y minimo 6 caracteres")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Las Contraseñas no son iguales")
    .run(req);

  let resultado = validationResult(req);

  //Verificar que el usuario este vacio
  if (!resultado.isEmpty()) {
    //Errores
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }
  const { nombre, email, password } = req.body;
  //Verificar que el usuario no este duplicado
  const existeUsuario = await Usuario.findOne({ where: { email } });
  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El Usuario ya esta registrado" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }
  //Almacenar un usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  //Envia Email de Confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });
  //Mostrar mensaje de confirmacion
  res.render("templates/mensaje", {
    pagina: "Cuenta Creada Correctamente",
    mensaje:
      "Enviamos un Email de Confirmacion, Presiona en el enlace para confirmar",
  });
};
//FUNCION QUE COMPRUEBA UNA NUEVA CUENTA
const confirmar = async (req, res) => {
  const { token } = req.params;
  //Verificar si el token es valido
  const usuario = await Usuario.findOne({ where: { token } });
  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al Confirmar la cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, Intentalo Nuevamente",
      error: true,
    });
  }
  //Confirmar la cuenta
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta se confirmo correctamente",
  });
};
/** FIN REGISTRO Y CONFIRMACION */

/******************* RESTABLECER UN PASSWORD *************************/
const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Recuperar Contraseña",
    csrfToken: req.csrfToken(),
  });
};
const resetPassword = async (req, res) => {
  //Validacion
  await check("email")
    .isEmail()
    .withMessage("Email valido obligatorio")
    .run(req);

  let resultado = validationResult(req);

  //Verificar que el usuario este vacio
  if (!resultado.isEmpty()) {
    //Errores
    return res.render("auth/olvide-password", {
      pagina: "Recuperar Contraseña",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }
  //Buscar al Usuario en la Base de Datos
  const { email } = req.body;
  const usuario = await Usuario.findOne({ where: { email } }); //findOne Busca un campo en la base de datos atraves de un Models.
  if (!usuario) {
    //Errores
    return res.render("auth/olvide-password", {
      pagina: "Recuperar Contraseña",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email no pertenece a ningun usuario" }],
    });
  }
  //Generar un Token y Enviar el EMAIL
  usuario.token = generarId();
  await usuario.save();

  //Enviar un Email
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  //Renderizar un mensaje
  res.render("templates/mensaje", {
    pagina: "Restablece tu Contraseña",
    mensaje: "Se envio un Email a tu correo con las intrucciones",
  });
};
const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const usuario = await Usuario.findOne({ where: { token } });
  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Restablece tu Password",
      mensaje: "Hubo un error al validar tu informacion, Intentalo Nuevamente",
      error: true,
    });
  }
  //Mostrar Formulario para que Coloque Nuevo Password
  res.render("auth/reset-password", {
    pagina: "Restablece tu Contraseña",
    csrfToken: req.csrfToken(),
  });
};
const nuevoPassword = async (req, res) => {
  //Validar el Password
  await check("password")
    .isLength({ min: 6 })
    .withMessage("Contraseña obligatoria y minimo 6 caracteres")
    .run(req);
  let resultado = validationResult(req);

  //Verificar que el usuario este vacio
  if (!resultado.isEmpty()) {
    //Errores
    return res.render("auth/reset-password", {
      pagina: "Restablece tu Contraseña",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }
  const { token } = req.params;
  const { password } = req.body;
  //Identificar quien hace el cambio
  const usuario = await Usuario.findOne({ where: { token } });

  //Hashear el nuevo Password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Contraseña restablecida",
    mensaje: "La Contraseña fue guardada correctamente",
  });
};
/***************************** FIN RESTBLECER PASSWORD ************************************* */
export {
  formularioLogin,
  autenticar,
  formularioRegistro,
  registrar,
  confirmar,
  formularioOlvidePassword,
  comprobarToken,
  nuevoPassword,
  resetPassword,
};
