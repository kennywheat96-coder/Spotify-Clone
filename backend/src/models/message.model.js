import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    senderId: { type:String, required: true }, //clerkid of the sender
    receiverId: { type:String, required: true }, //clerkid of the receiver
    Content: { type:String, required: true },
}, { timestamps: true });  // createdAt, updatedAt



export const Message = mongoose.model("Message", songSchema);
