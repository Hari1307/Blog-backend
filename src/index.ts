import * as bcrypt from 'bcrypt';
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import z from "zod";
import { userMiddleware } from './authMiddleware';
import { JWT_SECRET } from './config';
import { ContentModel, UserModel } from "./db";

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://hari:hari@cluster0.beglv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

app.post("/api/v1/signup", async (req, res) => {
    const requiredBody = z.object({
        username: z.string().min(5).max(40),
        password: z.string().min(3).max(15),
    });

    const parsedDataWithSafe = requiredBody.safeParse(req.body);

    if (!parsedDataWithSafe) {
        res.json({
            message: "incorrect format of input data",
            error: parsedDataWithSafe
        })
        return;
    }
    try {
        const { username, password } = req.body;

        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: "Username already taken. Please choose another one." });
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        await UserModel.create({
            username: username,
            password: hashedPassword
        });

        res.json({
            message: "You are signed up"
        })
    } catch (e) {
        console.log(e);
    }
})

app.post("/api/v1/signin", async (req, res) => {
    try {
        const { username, password } = req.body;

        const fuser = await UserModel.findOne({ username });

        const isValid = bcrypt.compare(password, fuser?.password as string);

        if (!isValid && !fuser) {
            res.status(403).json({
                message: "Incorrect credentials / unauthorized"
            })
        } else {
            const token = jwt.sign({
                userId: fuser?._id
            }, JWT_SECRET);

            res.json({
                token: token,
                message: "Signed In Successfully"
            })
        }
    } catch (e) {
        console.log(e);
    }
})

// @ts-ignore
app.post("/api/v1/content", userMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        // @ts-ignore
        const userId = req.userId;

        const _newContent = await ContentModel.create({ title, content, userId });

        res.status(201).json({ content: _newContent });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Failed to create content" });
    }
    // .populate("userId","username") <only trying to get username from the user table not all fields> this will be used to get users information based on the user id when we are trying to get the info of the content from content table
})


//@ts-ignore
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const content = await ContentModel.find({ userId }).populate("userId", "username");
        res.status(200).json({ content });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Failed to create content" });
    }
})

//@ts-ignore
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    try {
        const contentId = req.body.contentId;

        //@ts-ignore
        const userId = req.userId;

        const deletedContent = await ContentModel.deleteMany({ _id: contentId, userId: userId });

        res.status(200).json(deletedContent);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Failed to create content" });
    }
})


app.listen(3000, () => { console.log("Server is started at port 3000") })