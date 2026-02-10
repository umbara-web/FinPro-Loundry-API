"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearestOutletByCoordinates = exports.PickupGeoHelper = void 0;
const db_1 = __importDefault(require("../../configs/db"));
const geo_1 = require("../../common/utils/geo");
const customError_1 = require("../../common/utils/customError");
class PickupGeoHelper {
    static findClosestOutlet(outlets, userLat, userLong) {
        let nearestOutlet = outlets[0];
        let minDistance = Infinity;
        for (const outlet of outlets) {
            const dist = (0, geo_1.calculateDistance)(userLat, userLong, parseFloat(outlet.lat), parseFloat(outlet.long));
            if (dist < minDistance) {
                minDistance = dist;
                nearestOutlet = outlet;
            }
        }
        return { outlet: nearestOutlet, distance: minDistance };
    }
    static async findNearestOutlet(lat, long) {
        const outlets = await db_1.default.outlet.findMany();
        if (outlets.length === 0)
            throw (0, customError_1.createCustomError)(400, 'No outlets available');
        return this.findClosestOutlet(outlets, parseFloat(lat), parseFloat(long))
            .outlet;
    }
    static async findNearestOutletByCoordinates(lat, long) {
        const outlets = await db_1.default.outlet.findMany();
        if (outlets.length === 0)
            return { outlet: null, distance: null, isWithinRange: false };
        const { outlet, distance } = this.findClosestOutlet(outlets, parseFloat(lat), parseFloat(long));
        const isWithinRange = distance <= outlet.service_radius;
        const roundedDistance = Math.round(distance * 100) / 100;
        return {
            outlet: {
                id: outlet.id,
                name: outlet.name,
                address: outlet.address,
                serviceRadius: outlet.service_radius,
            },
            distance: roundedDistance,
            isWithinRange,
        };
    }
    static async getOrValidateOutlet(outletId, addressLat, addressLong) {
        if (!outletId) {
            const nearestOutlet = await this.findNearestOutlet(addressLat, addressLong);
            return nearestOutlet.id;
        }
        const outlet = await db_1.default.outlet.findUnique({ where: { id: outletId } });
        if (!outlet)
            throw (0, customError_1.createCustomError)(404, 'Outlet not found');
        return outletId;
    }
}
exports.PickupGeoHelper = PickupGeoHelper;
exports.findNearestOutletByCoordinates = PickupGeoHelper.findNearestOutletByCoordinates.bind(PickupGeoHelper);
