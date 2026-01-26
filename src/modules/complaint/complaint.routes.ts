import { Router } from 'express';
import { ComplaintController } from './complaint.controller';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import {
  validateBody,
  validateQuery,
} from '../../common/middlewares/validate.middleware';
import {
  createComplaintSchema,
  getComplaintsSchema,
  updateComplaintStatusSchema,
} from './complaint.schemas';

const router = Router();

// Create a new complaint
import { uploader } from '../../common/utils/uploader';

router.post(
  '/',
  authMiddleware,
  uploader.array('images', 5),
  validateBody(createComplaintSchema),
  ComplaintController.createComplaint
);

// Get all complaints for current user
router.get(
  '/',
  authMiddleware,
  validateQuery(getComplaintsSchema),
  ComplaintController.getComplaints
);

// Get complaint by order ID
router.get(
  '/order/:orderId',
  authMiddleware,
  ComplaintController.getComplaintByOrderId
);

// Get complaint by ID
router.get(
  '/:complaintId',
  authMiddleware,
  ComplaintController.getComplaintById
);

// Update complaint status
router.patch(
  '/:complaintId/status',
  authMiddleware,
  validateBody(updateComplaintStatusSchema),
  ComplaintController.updateStatus
);

// Chat Messages
import { ComplaintMessageController } from './complaint-message.controller';

router.post(
  '/:complaintId/messages',
  authMiddleware,
  ComplaintMessageController.createMessage
);

router.get(
  '/:complaintId/messages',
  authMiddleware,
  ComplaintMessageController.getMessages
);

export const ComplaintRoutes = router;
