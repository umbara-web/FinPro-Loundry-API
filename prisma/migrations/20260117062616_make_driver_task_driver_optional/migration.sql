-- DropForeignKey
ALTER TABLE "Driver_Task" DROP CONSTRAINT "Driver_Task_driver_id_fkey";

-- AlterTable
ALTER TABLE "Driver_Task" ALTER COLUMN "driver_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';

-- AddForeignKey
ALTER TABLE "Driver_Task" ADD CONSTRAINT "Driver_Task_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
