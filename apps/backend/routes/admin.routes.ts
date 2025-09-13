import { Router } from "express";
import { updateTenantPlan, updateUserPlan, sendInvitation } from "../controller/CRUD/admin.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";


const adminRouter = Router();

adminRouter.post("/update-tenant-plan",authenticate,authorize("ADMIN"), updateTenantPlan);
adminRouter.post("/update-user-plan", authenticate,authorize("ADMIN"),updateUserPlan);
adminRouter.post("/send-invitation", authenticate, authorize("ADMIN"), sendInvitation);
adminRouter.get("/sample",authenticate, (req,res) => {
    res.json({message:"Sample"})
})

export default adminRouter;
