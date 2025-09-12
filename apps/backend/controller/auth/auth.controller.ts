import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prismaClient } from 'db/client';
import type { Request, Response } from 'express';

interface RegisterRequestBody {
    email: string;
    password: string;
    role: 'MEMBER' | 'ADMIN';
    slug: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

interface RegisterTenantRequestBody {
    name:string;
    slug: string;
}

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    try {
        const {email, password, role, slug} = req.body;

        if(!email || !password || !role || !slug){
            return res.status(400).json({message:"Bad Request"})
        }

        const user = await prismaClient.user.findUnique({
            where:{
                email:email
            }
        })

        if(user){
            return res.status(409).json({message:"User already exists"})
        }

        const tenant = await prismaClient.tenant.findUnique({
            where:{
                slug:slug
            }
        })

        if(!tenant){
            return res.status(404).json({message:"Tenant not found"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await prismaClient.user.create({
            data:{
                email:email,
                password:hashedPassword,
                role:role,
                tenantId:tenant.id
            }
        })

        if(!process.env.JWT_SECRET){
            return res.status(500).json({message:"JWT Secret not found"})
        }

        const token = jwt.sign({
            id:newUser.id,
            tenantId:newUser.tenantId,
            role:newUser.role
        },process.env.JWT_SECRET as string,{
            expiresIn:"7d"
        })

        return res.status(201).json({message:"User created successfully",user: newUser,token})
            
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {

    try {

        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({message:"Bad Request"})
        }

        const user = await prismaClient.user.findUnique({
            where:{
                email:email
            }
        })

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const validPassword = await bcrypt.compare(password,user.password)

        if(!validPassword){
            return res.status(401).json({message:"Unauthorized"})
        }

        const token = jwt.sign({
            id:user.id,
            tenantId:user.tenantId,
            role:user.role
        },process.env.JWT_SECRET as string,{
            expiresIn:"7d"
        })

        return res.status(200).json({message:"User logged in successfully",user: user,token})
        
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }

}

export const registerTenant = async (req: Request<{}, {}, RegisterTenantRequestBody>, res: Response) => {
    try {

        const {name,slug} = req.body;

        if(!name || !slug){
            return res.status(400).json({message:"Bad Request"})
        }

        const tenant = await prismaClient.tenant.findUnique({
            where:{
                slug:slug
            }
        })

        if(tenant){
            return res.status(409).json({message:"Tenant already exists"})
        }

        const newTenant = await prismaClient.tenant.create({
            data:{
                name:name,
                slug:slug,
            }
        })

        return res.status(201).json({message:"Tenant created successfully",tenant: newTenant})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}
    