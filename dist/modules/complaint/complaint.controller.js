"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintController = void 0;
const complaint_service_1 = require("./complaint.service");
const cloudinary_1 = require("../../configs/cloudinary");
class ComplaintController {
    /**
     * Create a new complaint
     */
    static async createComplaint(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new Error('User not authenticated');
            }
            const { orderId, type, description } = req.body;
            const files = req.files;
            let images = [];
            if (files && files.length > 0) {
                // Upload images to Cloudinary
                const uploadPromises = files.map((file) => (0, cloudinary_1.cloudinaryUpload)(file, 'complaints'));
                const uploadResults = await Promise.all(uploadPromises);
                images = uploadResults.map((result) => result.secure_url);
            }
            const complaint = await complaint_service_1.ComplaintService.createComplaint({
                orderId,
                customerId: user.userId,
                type: type,
                description,
                images,
            });
            res.status(201).json({
                message: 'Complaint submitted successfully',
                data: complaint,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get all complaints for current user
     */
    static async getComplaints(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new Error('User not authenticated');
            }
            const { page, limit, status, sortBy, sortOrder, search } = req.query;
            const result = await complaint_service_1.ComplaintService.getComplaints({
                customerId: user.userId,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status: status,
                sortBy,
                sortOrder: sortOrder,
                search: search,
            });
            res.status(200).json({
                message: 'Complaints retrieved successfully',
                data: result.data,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get a single complaint by ID
     */
    static async getComplaintById(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new Error('User not authenticated');
            }
            const { complaintId } = req.params;
            const complaint = await complaint_service_1.ComplaintService.getComplaintById(complaintId, user.userId);
            res.status(200).json({
                message: 'Complaint retrieved successfully',
                data: complaint,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get complaint by order ID
     */
    static async getComplaintByOrderId(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new Error('User not authenticated');
            }
            const { orderId } = req.params;
            const complaint = await complaint_service_1.ComplaintService.getComplaintByOrderId(orderId, user.userId);
            res.status(200).json({
                message: complaint
                    ? 'Complaint found'
                    : 'No complaint found for this order',
                data: complaint,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update complaint status
     */
    static async updateStatus(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new Error('User not authenticated');
            }
            // In real app, check if user is admin. For now, we allow it for testing/context.
            // if (user.role !== 'OUTLET_ADMIN' && user.role !== 'SUPER_ADMIN') ...
            const { complaintId } = req.params;
            const { status } = req.body;
            const complaint = await complaint_service_1.ComplaintService.updateStatus(complaintId, status);
            res.status(200).json({
                message: 'Complaint status updated successfully',
                data: complaint,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ComplaintController = ComplaintController;
