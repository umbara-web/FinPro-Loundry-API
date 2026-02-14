"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorker = exports.updateWorker = exports.createWorker = exports.getWorkerById = exports.getWorkers = void 0;
const workerService = __importStar(require("../services/worker.service"));
const getWorkers = async (req, res) => {
    try {
        const workers = await workerService.getWorkers();
        res.json(workers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
};
exports.getWorkers = getWorkers;
const getWorkerById = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await workerService.getWorkerById(id);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json(worker);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch worker' });
    }
};
exports.getWorkerById = getWorkerById;
const createWorker = async (req, res) => {
    try {
        const worker = await workerService.createWorker(req.body);
        res.status(201).json(worker);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create worker' });
    }
};
exports.createWorker = createWorker;
const updateWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await workerService.updateWorker(id, req.body);
        res.json(worker);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update worker' });
    }
};
exports.updateWorker = updateWorker;
const deleteWorker = async (req, res) => {
    try {
        const { id } = req.params;
        await workerService.deleteWorker(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete worker' });
    }
};
exports.deleteWorker = deleteWorker;
