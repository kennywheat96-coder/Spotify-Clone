import mongoose from "mongoose";

export const connectDB = async () => {
  try {
   const connection = await mongoose.connect(process.env.MONGO_URI);
   console.log(`Connected to MongoDB: ${connection.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); //1 is for failure, 0 is for success
  }
}