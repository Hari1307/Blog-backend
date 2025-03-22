import { type NextFunction, type Request, type Response } from 'express';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from './config';
export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(403).json({ message: "Authorization header is missing or malformed" });
        }

        const token = authorization.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded) {
            // @ts-ignore
            req.userId = decoded.userId;
            next();
        } else {
            res.status(403).json({ message: "invalid Jwttoken" })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}