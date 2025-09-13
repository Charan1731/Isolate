import type { Request, Response } from "express";
import { prismaClient } from "db/client";
import { getEmailService } from "../../services/email.service";

interface UpdatePlanRequestBody {
    plan: string;
    userId: string;
}

interface SendInvitationRequestBody{
    email:string;
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

export const sendInvitation = async(req:Request<{},SendInvitationRequestBody>,res:Response) => {
    try {
        const {email} = req.body;

        if(!email){
            return res.status(400).json({message:"Email is required"})
        }

        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: req.user.id
            },
            include: {
                tenant: true
            }
        });

        if(!adminUser || !adminUser.tenant){
            return res.status(404).json({message:"Admin or tenant not found"})
        }

        const existingUser = await prismaClient.user.findUnique({
            where: {
                email: email
            }
        });

        if(existingUser && existingUser.tenantId === adminUser.tenantId){
            return res.status(409).json({message:"User is already a member of this organization"})
        }

        const emailService = getEmailService();
        
        const isConnected = await emailService.verifyConnection();
        if(!isConnected){
            return res.status(500).json({message:"Email service is not configured properly"})
        }

        const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite?token=${Buffer.from(`${email}:${adminUser.tenantId}`).toString('base64')}`;

        const emailSent = await emailService.sendInvitationEmail({
            recipientEmail: email,
            senderName: adminUser.email,
            organizationName: adminUser.tenant.name,
            invitationLink: invitationLink
        });

        if(!emailSent){
            return res.status(500).json({message:"Failed to send invitation email"})
        }

        const invitationToken = Buffer.from(`${email}:${adminUser.tenantId}:${Date.now()}`).toString('base64');
        
        try {
            await prismaClient.invitation.create({
                data: {
                    email: email,
                    token: invitationToken,
                    tenantId: adminUser.tenantId,
                    invitedBy: adminUser.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                }
            });
        } catch (dbError) {
            console.log('Note: Failed to create invitation record in database, but email was sent successfully.');
        }

        return res.status(200).json({
            message: "Invitation sent successfully",
            email: email,
            invitationLink: invitationLink
        });
        
    } catch (error) {
        console.error('Error sending invitation:', error);
        return res.status(500).json({message:"Internal Server Error"})
    }
}
    
