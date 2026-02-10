"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintRoutes = void 0;
const express_1 = require("express");
const complaint_controller_1 = require("./complaint.controller");
const auth_middleware_1 = require("../../common/middlewares/auth.middleware");
const validate_middleware_1 = require("../../common/middlewares/validate.middleware");
const complaint_schemas_1 = require("./complaint.schemas");
const router = (0, express_1.Router)();
// Create a new complaint
const uploader_1 = require("../../common/utils/uploader");
router.post('/', auth_middleware_1.authMiddleware, uploader_1.uploader.array('images', 5), (0, validate_middleware_1.validateBody)(complaint_schemas_1.createComplaintSchema), complaint_controller_1.ComplaintController.createComplaint);
// Get all complaints for current user
router.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateQuery)(complaint_schemas_1.getComplaintsSchema), complaint_controller_1.ComplaintController.getComplaints);
// Get complaint by order ID
router.get('/order/:orderId', auth_middleware_1.authMiddleware, complaint_controller_1.ComplaintController.getComplaintByOrderId);
// Get complaint by ID
router.get('/:complaintId', auth_middleware_1.authMiddleware, complaint_controller_1.ComplaintController.getComplaintById);
// Update complaint status
router.patch('/:complaintId/status', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateBody)(complaint_schemas_1.updateComplaintStatusSchema), complaint_controller_1.ComplaintController.updateStatus);
// Chat Messages
const complaint_message_controller_1 = require("./complaint-message.controller");
router.post('/:complaintId/messages', auth_middleware_1.authMiddleware, complaint_message_controller_1.ComplaintMessageController.createMessage);
router.get('/:complaintId/messages', auth_middleware_1.authMiddleware, complaint_message_controller_1.ComplaintMessageController.getMessages);
exports.ComplaintRoutes = router;
