import { Router } from "express";
import { createNode, deleteNote, getNote, getTenantNotes, getUserNotes, updateNote } from "../controller/CRUD/user.controller";
import { authenticate,authorize } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.post("/create-node", authenticate,authorize("MEMBER"), createNode);
userRouter.get("/get-tenant-notes", authenticate,authorize("MEMBER","ADMIN"), getTenantNotes);
userRouter.get("/get-user-notes", authenticate,authorize("MEMBER","ADMIN"), getUserNotes);
userRouter.get("/get-note", authenticate,authorize("MEMBER","ADMIN"), getNote);
userRouter.put("/update-note", authenticate,authorize("MEMBER"), updateNote);
userRouter.delete("/delete-note", authenticate,authorize("MEMBER","ADMIN"), deleteNote);

export default userRouter;
