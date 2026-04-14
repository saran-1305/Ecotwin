
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecoimpact');
        console.log(`[database]: MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[database]: Error: ${(error as Error).message}`);
        process.exit(1);
    }
};

export default connectDB;
