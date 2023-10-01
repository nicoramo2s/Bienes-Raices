import jwt, { decode } from "jsonwebtoken";
import { Usuario } from "../models/Index.js";

const protegerRuta = async (req, res, next) => {
  // VERIFICAR SI HAY UN TOKEN
  const { _token } = req.cookies;
  if (!_token) {
    return res.redirect("/auth/login");
  }

  // COMPROBAR TOKEN
  try {
    const decoded = jwt.verify(_token, "palabrasupersecreta");
    // CON SCOPE RESTRINGIMOS LOS DATOS DEL USUARIO
    const usuario = await Usuario.scope("eliminarPassword").findByPk(decoded.id);
    // ALMACENAR EL USUARIO AL Request
    if (usuario) {
      req.usuario = usuario;
    } else {
      return res.redirect("/auth/login");
    }
    return next();
  } catch (error) {
    return res.clearCookies("_token").redirect("/auth/login");
  }
};
export default protegerRuta;
