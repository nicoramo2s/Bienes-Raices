import bcrypt from "bcrypt";

const usuario = [
  {
    nombre: "nicolas",
    email: "nicolas@nicolas.com",
    confirmado: 1,
    password: bcrypt.hashSync("password", 10),
  },
];

export default usuario;
