import { prismaClient } from "db/client";
import type { Request, Response } from "express";

interface CreateNodeRequestBody {
    title:string;
    content:string;
}

interface UpdateNoteRequestBody {
    title:string;
    content:string;
}


export const getTenantNotes = async(req:Request,res:Response) => {
    try {

        const notes = await prismaClient.note.findMany({
            where:{
                tenantId:req.user?.tenantId,
                deleted:false
            }
        })

        return res.status(200).json({message:"Notes fetched successfully", notes})
        
    } catch (error) {
        return res.status(500).json({message:"Error fetching notes"})
    }
}

export const getUserNotes = async(req:Request,res:Response) => {
    try {

        const notes = await prismaClient.note.findMany({
            where:{
                userId:req.user?.id,
                deleted:false
            }
        })

        return res.status(200).json({message:"Notes fetched successfully", notes})
        
    } catch (error) {
        return res.status(500).json({message:"Error fetching notes"})
    }
}

export const createNode = async(req:Request<{},CreateNodeRequestBody>,res:Response) => {
    try {

        const {title,content} = req.body;

        if(!title || !content){
            return res.status(400).json({message:"Bad Request"})
        }

        if(!req.user?.tenantId || !req.user?.id){
            return res.status(401).json({message:"Unauthorized - Missing user information"})
        }


        if(req.user?.role === "MEMBER" && await getUserNotesCount(req.user?.id as string) >= 3){
            return res.status(400).json({message:"Note limit reached"})
        }


        const note = await prismaClient.note.create({
            data:{
                title:title,
                content:content,
                tenantId:req.user.tenantId,
                userId:req.user.id
            }
        })

        return res.status(201).json({message:"Note created successfully", note})
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}


export const getNote = async(req:Request,res:Response) => {
    try {

        const note = await prismaClient.note.findUnique({
            where:{
                id:req.params.id
            }
        })

        return res.status(200).json({message:"Note fetched successfully", note})
        
    } catch (error) {
        return res.status(500).json({message:"Error fetching note"})
    }
}

export const updateNote = async(req:Request<{id:string},UpdateNoteRequestBody>,res:Response) => {
    try {

        const {title,content} = req.body;

        if(!title || !content){
            return res.status(400).json({message:"Bad Request"})
        }

        const note = await prismaClient.note.update({
            where:{
                id:req.query.id as string
            },
            data:{
                title:title,
                content:content
            }
        })

        return res.status(200).json({message:"Note updated successfully", note})
        
    } catch (error) {
        return res.status(500).json({message:"Error updating note"})
    }
}

export const deleteNote = async(req:Request<{id:string},UpdateNoteRequestBody>,res:Response) => {
    try {

        const id = req.query.id
        console.log(id)

        const note = await prismaClient.note.update({
            where:{
                id:id as string
            },
            data:{
                deleted:true
            }
        })

        return res.status(200).json({message:"Note deleted successfully", note})
        
    } catch (error) {
        return res.status(500).json({message:"Error deleting note"})
    }
}

const getUserNotesCount = async(userId:string) => {
    const notes = await prismaClient.note.findMany({
        where:{
            userId:userId,
            deleted:false
        }
    })
    return notes.length
}


    