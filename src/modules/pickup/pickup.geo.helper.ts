import prisma from '../../configs/db';
import { calculateDistance } from '../../common/utils/geo';
import { createCustomError } from '../../common/utils/customError';
import { OutletWithRadius } from './pickup.types';

export class PickupGeoHelper {
  static findClosestOutlet(
    outlets: OutletWithRadius[],
    userLat: number,
    userLong: number
  ) {
    let nearestOutlet = outlets[0];
    let minDistance = Infinity;

    for (const outlet of outlets) {
      const dist = calculateDistance(
        userLat,
        userLong,
        parseFloat(outlet.lat),
        parseFloat(outlet.long)
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestOutlet = outlet;
      }
    }
    return { outlet: nearestOutlet, distance: minDistance };
  }

  static async findNearestOutlet(lat: string, long: string) {
    const outlets = await prisma.outlet.findMany();
    if (outlets.length === 0)
      throw createCustomError(400, 'No outlets available');
    return this.findClosestOutlet(outlets, parseFloat(lat), parseFloat(long))
      .outlet;
  }

  static async findNearestOutletByCoordinates(lat: string, long: string) {
    const outlets = await prisma.outlet.findMany();
    if (outlets.length === 0)
      return { outlet: null, distance: null, isWithinRange: false };

    const { outlet, distance } = this.findClosestOutlet(
      outlets,
      parseFloat(lat),
      parseFloat(long)
    );
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

  static async getOrValidateOutlet(
    outletId: string | undefined,
    addressLat: string,
    addressLong: string
  ) {
    if (!outletId) {
      const nearestOutlet = await this.findNearestOutlet(
        addressLat,
        addressLong
      );
      return nearestOutlet.id;
    }
    const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
    if (!outlet) throw createCustomError(404, 'Outlet not found');
    return outletId;
  }
}

export const findNearestOutletByCoordinates =
  PickupGeoHelper.findNearestOutletByCoordinates.bind(PickupGeoHelper);
