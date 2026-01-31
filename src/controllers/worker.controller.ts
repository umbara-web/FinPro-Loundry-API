import { Request, Response, NextFunction } from "express";
import { getStationTasksService, processTaskService, requestBypassService } from "../services/worker.service";

export const getStationTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const worker_id = req.user?.userId;
    if (!worker_id) throw new Error("Unauthorized");

    const tasks = await getStationTasksService(worker_id);
    res.status(200).send({ data: tasks });
  } catch (error) {
    next(error);
  }
};

export const processTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { items } = req.body;
    const userId = req.user?.userId;
    if (!userId) throw new Error("Unauthorized");

    const result = await processTaskService(taskId, items, userId);
    
    if (result.code === "MISMATCH") {
        res.status(400).send(result);
    } else {
        res.status(200).send(result);
    }
  } catch (error) {
    next(error);
  }
};

export const requestBypass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { reason, outletAdminId } = req.body;

    const result = await requestBypassService(taskId, reason, outletAdminId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
