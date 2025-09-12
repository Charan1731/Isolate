import { Router } from "express";
import { createNode, deleteNote, getNote, getTenantNotes, getUserNotes, updateNote } from "../controller/CRUD/user.controller";
import { authenticate,authorize } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.post("/create-node", authenticate,authorize("MEMBER"), createNode);
userRouter.get("/get-tenant-notes", authenticate,authorize("MEMBER"), getTenantNotes);
userRouter.get("/get-user-notes", authenticate,authorize("MEMBER"), getUserNotes);
userRouter.get("/get-note", authenticate,authorize("MEMBER"), getNote);
userRouter.put("/update-note", authenticate,authorize("MEMBER"), updateNote);
userRouter.delete("/delete-note", authenticate,authorize("MEMBER"), deleteNote);

export default userRouter;
