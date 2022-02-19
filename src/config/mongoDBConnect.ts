import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    
    await mongoose.connect(process?.env?.MONGODB_KEY)

    console.log(`MongoDB Connected`)
    } catch (error) {
        console.error(`Error: ${error}`)
        process.exit(1)
    }
}

export default connectDB