import jwt from 'jsonwebtoken';

const generarJWT = datos => jwt.sign({ id: datos.id, nombre: datos.nombre }, "palabrasupersecreta", { expiresIn: '1d' });

const generarId = () => Math.random().toString(32).substring(2) + Date.now().toString(32);




export {
    generarId,
    generarJWT
}