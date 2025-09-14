import { Router } from "express";
import { 
    updateTenantPlan, 
    updateUserPlan, 
    sendInvitation, 
    getTenantUsers, 
    deleteUser, 
    getTenantStats, 
    getAuditLogs, 
    getPendingInvitations, 
    updateUserRole 
} from "../controller/CRUD/admin.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";


const adminRouter = Router();
adminRouter.post("/update-tenant-plan", authenticate, authorize("ADMIN"), updateTenantPlan);
adminRouter.post("/update-user-plan", authenticate, authorize("ADMIN"), updateUserPlan);
adminRouter.get("/users", authenticate, authorize("ADMIN"), getTenantUsers);
adminRouter.post("/delete-user", authenticate, authorize("ADMIN"), deleteUser);
adminRouter.post("/update-user-role", authenticate, authorize("ADMIN"), updateUserRole);
adminRouter.post("/send-invitation", authenticate, authorize("ADMIN"), sendInvitation);
adminRouter.get("/invitations", authenticate, authorize("ADMIN"), getPendingInvitations);
adminRouter.get("/stats", authenticate, authorize("ADMIN"), getTenantStats);
adminRouter.get("/audit-logs", authenticate, authorize("ADMIN"), getAuditLogs);

export default adminRouter;
