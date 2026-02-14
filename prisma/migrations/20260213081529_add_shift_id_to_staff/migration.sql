-- DropForeignKey
ALTER TABLE "Station_Task" DROP CONSTRAINT "Station_Task_worker_id_fkey";

-- DropIndex
DROP INDEX "Staff_outlet_id_key";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "shift_id" TEXT;

-- AlterTable
ALTER TABLE "Station_Task" ALTER COLUMN "worker_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station_Task" ADD CONSTRAINT "Station_Task_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
