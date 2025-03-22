import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String }
})

export const UserModel = model("users", UserSchema);

const ContentSchema = new Schema({
    title: String,
    content: String,
    userId: { ref: "users", required: true, type: Schema.Types.ObjectId }
})

export const ContentModel = model("content", ContentSchema);
