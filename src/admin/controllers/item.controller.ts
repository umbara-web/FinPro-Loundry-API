import { Request, Response } from 'express';
import { ItemCategory, ItemUnit, ItemStatus } from '@prisma/client';
import * as itemService from '../services/item.service';

export const getItems = async (req: Request, res: Response) => {
    try {
        const { search, category, status } = req.query;
        const items = await itemService.getItems(
            search as string,
            category as string,
            status as string
        );
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getItemById = async (req: Request, res: Response) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createItem = async (req: Request, res: Response) => {
    try {
        const rawData = req.body;
        const mapCategory = (cat: string): ItemCategory => {
            switch (cat) {
                case 'Cuci Setrika': return ItemCategory.CUCI_SETRIKA;
                case 'Satuan': return ItemCategory.SATUAN;
                case 'Dry Clean': return ItemCategory.DRY_CLEAN;
                default: return ItemCategory.CUCI_SETRIKA;
            }
        };

        const mapUnit = (unit: string): ItemUnit => {
            switch (unit) {
                case 'kg': return ItemUnit.KG;
                case 'pcs': return ItemUnit.PCS;
                case 'm²': return ItemUnit.M2;
                default: return ItemUnit.PCS;
            }
        };

        const mapStatus = (status: string): ItemStatus => {
            return status === 'Aktif' ? ItemStatus.ACTIVE : ItemStatus.INACTIVE;
        };

        const data = {
            name: rawData.name,
            price: parseInt(rawData.price, 10),
            category: mapCategory(rawData.category),
            unit: mapUnit(rawData.unit),
            status: mapStatus(rawData.status),
            ...(rawData.imageUrl ? { imageUrl: rawData.imageUrl } : {}),
        };

        const item = await itemService.createItem(data);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const rawData = req.body;

        const mapCategory = (cat: string): ItemCategory | undefined => {
            if (!cat) return undefined;
            if (cat === 'Cuci Setrika') return ItemCategory.CUCI_SETRIKA;
            if (cat === 'Satuan') return ItemCategory.SATUAN;
            if (cat === 'Dry Clean') return ItemCategory.DRY_CLEAN;
            return undefined;
        };

        const mapUnit = (unit: string): ItemUnit | undefined => {
            if (!unit) return undefined;
            if (unit === 'kg') return ItemUnit.KG;
            if (unit === 'pcs') return ItemUnit.PCS;
            if (unit === 'm²') return ItemUnit.M2;
            return undefined;
        };

        const mapStatus = (status: string): ItemStatus | undefined => {
            if (!status) return undefined;
            if (status === 'Aktif' || status === 'ACTIVE') return ItemStatus.ACTIVE;
            return ItemStatus.INACTIVE;
        };

        const data = {
            ...(rawData.name !== undefined ? { name: rawData.name } : {}),
            ...(rawData.price !== undefined ? { price: parseInt(rawData.price, 10) } : {}),
            ...(rawData.category !== undefined ? { category: mapCategory(rawData.category) } : {}),
            ...(rawData.unit !== undefined ? { unit: mapUnit(rawData.unit) } : {}),
            ...(rawData.status !== undefined ? { status: mapStatus(rawData.status) } : {}),
            ...(rawData.imageUrl !== undefined ? { imageUrl: rawData.imageUrl } : {}),
        };

        const item = await itemService.updateItem(req.params.id, data);
        res.json(item);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        await itemService.deleteItem(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
