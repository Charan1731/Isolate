import type { NextFunction,Request,Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import { prismaClient } from "db/client"

dotenv.config()
interface User {
    id: string;
    tenantId: string;
    role: string;
}

declare global{
    namespace Express{
        interface Request{
            user?: User;
        }
    }
}

export const authenticate = async (req:Request,res:Response,next:NextFunction) => {
    
    try {
        const token = req.headers.authorization?.split(" ")[1];
    
        if(!token){
            return res.status(401).json({message:"No token found"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        
        if (typeof decoded === 'string' || !decoded.id) {
            return res.status(401).json({message: "Invalid token"});
        }
        const userId = decoded.id;
        
        const user = await prismaClient.user.findUnique({
            where:{
                id:userId
            }
        })

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        req.user = user;
        
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const authorize = (...allowedRoles:string[]) =>
    (req:Request,res:Response,next:NextFunction) => {

        if(!req.user){
            return res.status(401).json({message:"No user found"})
        }

        console.log(req.user.role)
        console.log(allowedRoles)
        if(!allowedRoles.includes(req.user.role)){
            return res.status(401).json({message:"Unauthorized"})
        }
        
        next();
    }