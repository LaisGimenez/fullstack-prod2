import { connect } from 'mongoose';
import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI;

const connDB = async () => {
    try {
        await connect(MONGODB_URI);
        console.log('¡CONECTADO!');
    } catch (error) {
        console.log(error);
        throw new Error("ERROR AL CONECTAR A LA BBDD");
    }
}

export { connDB };


