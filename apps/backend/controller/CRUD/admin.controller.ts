import type { Request, Response } from "express";
import { prismaClient } from "db/client";

interface UpdatePlanRequestBody {
    plan: string;
    userId: string;
}

export const updateTenantPlan = async(req:Request<{},UpdatePlanRequestBody>,res:Response) => {
    try {

        const {plan} = req.body;

        if(!plan){
            return res.status(400).json({message:"Bad Request"})
        }

        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const tenant = await prismaClient.tenant.findUnique({
            where:{
                id:req.user.tenantId
            }
        })

        if(!tenant){
            return res.status(404).json({message:"Tenant not found"})
        }

        const updatedTenant = await prismaClient.tenant.update({
            where:{
                id:tenant.id
            },
            data:{
                plan:plan
            }
        })

        return res.status(200).json({message:"Plan updated successfully",tenant: updatedTenant})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const updateUserPlan = async(req:Request<{},UpdatePlanRequestBody>,res:Response) => {
    try {
        const {plan,userId} = req.body;

        if(!plan){
            return res.status(400).json({message:"Bad Request"})
        }

        const user = await prismaClient.user.findUnique({
            where:{
                id:userId,
            }
        })

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        if(user?.tenantId !== req.user?.tenantId){
            return res.status(401).json({message:"User does not belong to this tenant"})
        }

        const updatedUser = await prismaClient.user.update({
            where:{
                id:userId
            },
            data:{
                plan:plan
            }
        })

        return res.status(200).json({message:"Plan updated successfully",user: updatedUser})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}