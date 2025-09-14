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

        const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000/auth'}`;

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

export const getTenantUsers = async(req:Request,res:Response) => {
    try {
        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const users = await prismaClient.user.findMany({
            where:{
                tenantId: req.user.tenantId,
                deleted: false
            },
            select: {
                id: true,
                email: true,
                role: true,
                plan: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        notes:{
                            where:{
                                deleted:false
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.status(200).json({message:"Users retrieved successfully", users})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const deleteUser = async(req:Request,res:Response) => {
    try {
        const { userId } = req.body;

        if(!userId){
            return res.status(400).json({message:"User ID is required"})
        }

        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const user = await prismaClient.user.findUnique({
            where:{
                id: userId,
            }
        })

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        if(user.tenantId !== req.user.tenantId){
            return res.status(401).json({message:"User does not belong to this tenant"})
        }

        if(user.id === req.user.id){
            return res.status(400).json({message:"You cannot delete yourself"})
        }

        // Soft delete the user
        const deletedUser = await prismaClient.user.update({
            where:{
                id: userId
            },
            data:{
                deleted: true
            }
        })

        // Create audit log
        await prismaClient.auditLog.create({
            data: {
                tenantId: req.user.tenantId,
                userId: req.user.id,
                action: `Deleted user ${user.email}`
            }
        });

        return res.status(200).json({message:"User deleted successfully", user: deletedUser})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const getTenantStats = async(req:Request,res:Response) => {
    try {
        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const [userCount, noteCount, invitationCount] = await Promise.all([
            prismaClient.user.count({
                where: {
                    tenantId: req.user.tenantId,
                    deleted: false
                }
            }),
            prismaClient.note.count({
                where: {
                    tenantId: req.user.tenantId,
                    deleted: false
                }
            }),
            prismaClient.invitation.count({
                where: {
                    tenantId: req.user.tenantId,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            })
        ]);

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: req.user.tenantId
            }
        });

        return res.status(200).json({
            message:"Statistics retrieved successfully", 
            stats: {
                userCount,
                noteCount,
                invitationCount,
                tenant
            }
        })
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const getAuditLogs = async(req:Request,res:Response) => {
    try {
        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const { page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const auditLogs = await prismaClient.auditLog.findMany({
            where:{
                tenantId: req.user.tenantId
            },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: Number(limit)
        })

        const totalCount = await prismaClient.auditLog.count({
            where: {
                tenantId: req.user.tenantId
            }
        });

        return res.status(200).json({
            message:"Audit logs retrieved successfully", 
            auditLogs,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / Number(limit)),
                totalCount,
                hasNext: skip + Number(limit) < totalCount,
                hasPrev: Number(page) > 1
            }
        })
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const getPendingInvitations = async(req:Request,res:Response) => {
    try {
        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const invitations = await prismaClient.invitation.findMany({
            where:{
                tenantId: req.user.tenantId,
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.status(200).json({message:"Invitations retrieved successfully", invitations})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const updateUserRole = async(req:Request,res:Response) => {
    try {
        const { userId, role } = req.body;

        if(!userId || !role){
            return res.status(400).json({message:"User ID and role are required"})
        }

        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const user = await prismaClient.user.findUnique({
            where:{
                id: userId,
            }
        })

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        if(user.tenantId !== req.user.tenantId){
            return res.status(401).json({message:"User does not belong to this tenant"})
        }

        if(user.id === req.user.id){
            return res.status(400).json({message:"You cannot change your own role"})
        }

        const updatedUser = await prismaClient.user.update({
            where:{
                id: userId
            },
            data:{
                role: role
            }
        })

        // Create audit log
        await prismaClient.auditLog.create({
            data: {
                tenantId: req.user.tenantId,
                userId: req.user.id,
                action: `Updated role of ${user.email} to ${role}`
            }
        });

        return res.status(200).json({message:"User role updated successfully", user: updatedUser})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const getAdminTenantNotes = async(req:Request,res:Response) => {
    try {
        if(!req.user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const notes = await prismaClient.note.findMany({
            where:{
                tenantId: req.user.tenantId,
                deleted: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        plan: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return res.status(200).json({message:"Notes retrieved successfully", notes})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}
