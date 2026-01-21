/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `driver_delivery_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `driver_pickup_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `item_name` on the `Order_Item` table. All the data in the column will be lost.
  - You are about to drop the column `qty_initial` on the `Order_Item` table. All the data in the column will be lost.
  - You are about to drop the column `qty_ironing` on the `Order_Item` table. All the data in the column will be lost.
  - You are about to drop the column `qty_packing` on the `Order_Item` table. All the data in the column will be lost.
  - You are about to drop the column `qty_washing` on the `Order_Item` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Bypass_Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Worker` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `outlet_admin_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickup_request_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `laundry_item_id` to the `Order_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `Order_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_radius` to the `Outlet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Outlet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Staff_Type" AS ENUM ('OUTLET_ADMIN', 'WORKER', 'DRIVER');

-- CreateEnum
CREATE TYPE "Attendance_Status" AS ENUM ('PRESENT', 'LATE', 'ABSENT');

-- CreateEnum
CREATE TYPE "Pickup_Request_Status" AS ENUM ('WAITING_DRIVER', 'DRIVER_ASSIGNED', 'PICKED_UP', 'ARRIVED_OUTLET', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Order_Status" AS ENUM ('CREATED', 'WAITING_PAYMENT', 'PAID', 'IN_WASHING', 'IN_IRONING', 'IN_PACKING', 'READY_FOR_DELIVERY', 'ON_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "Station_Task_Type" AS ENUM ('WASHING', 'IRONING', 'PACKING');

-- CreateEnum
CREATE TYPE "Station_Task_Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'NEED_BYPASS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Bypass_Request_Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Payment_Status" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Driver_Task_Type" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "Driver_Task_Status" AS ENUM ('AVAILABLE', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Notification_Type" AS ENUM ('PAYMENT_REMINDER', 'PICKUP_REQUEST', 'DELIVERY_REQUEST', 'BYPASS_REQUEST');

-- CreateEnum
CREATE TYPE "Complaint_Type" AS ENUM ('DAMAGE', 'LOST', 'NOT_MATCH', 'REJECTED');

-- CreateEnum
CREATE TYPE "Complaint_Status" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- DropIndex
DROP INDEX "Order_customer_id_key";

-- DropIndex
DROP INDEX "Order_driver_delivery_id_key";

-- DropIndex
DROP INDEX "Order_driver_pickup_id_key";

-- DropIndex
DROP INDEX "Order_outlet_id_key";

-- DropIndex
DROP INDEX "Order_Item_item_name_key";

-- DropIndex
DROP INDEX "Order_Item_order_id_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "createdAt",
DROP COLUMN "customer_id",
DROP COLUMN "driver_delivery_id",
DROP COLUMN "driver_pickup_id",
DROP COLUMN "payment_status",
DROP COLUMN "total_price",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "outlet_admin_id" TEXT NOT NULL,
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "pickup_request_id" TEXT NOT NULL,
ADD COLUMN     "price_total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Order_Status" NOT NULL DEFAULT 'CREATED',
ALTER COLUMN "total_weight" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Order_Item" DROP COLUMN "item_name",
DROP COLUMN "qty_initial",
DROP COLUMN "qty_ironing",
DROP COLUMN "qty_packing",
DROP COLUMN "qty_washing",
ADD COLUMN     "laundry_item_id" TEXT NOT NULL,
ADD COLUMN     "qty" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Outlet" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "service_radius" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- DropTable
DROP TABLE "Bypass_Log";

-- DropTable
DROP TABLE "Worker";

-- DropEnum
DROP TYPE "Worker_Type";

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "staff_type" "Staff_Type" NOT NULL DEFAULT 'WORKER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "check_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out_at" TIMESTAMP(3),
    "status" "Attendance_Status" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer_Address" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "long" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laundry_Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Laundry_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pickup_Request" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "schedulled_pickup_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "assigned_outlet_id" TEXT NOT NULL,
    "assigned_driver_id" TEXT,
    "status" "Pickup_Request_Status" NOT NULL DEFAULT 'WAITING_DRIVER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pickup_Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station_Task" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "task_type" "Station_Task_Type" NOT NULL DEFAULT 'WASHING',
    "worker_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "status" "Station_Task_Status" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "Station_Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station_Task_Item" (
    "id" TEXT NOT NULL,
    "station_task_id" TEXT NOT NULL,
    "laundry_item_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "Station_Task_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bypass_Request" (
    "id" TEXT NOT NULL,
    "station_task_id" TEXT NOT NULL,
    "outlet_admin_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "Bypass_Request_Status" NOT NULL DEFAULT 'PENDING',
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "Bypass_Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "method" TEXT,
    "amount" DOUBLE PRECISION,
    "status" "Payment_Status" NOT NULL DEFAULT 'PENDING',
    "payment_ref" TEXT,
    "paid_at" TIMESTAMP(3),
    "payment_img_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver_Task" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "task_type" "Driver_Task_Type" NOT NULL,
    "status" "Driver_Task_Status" NOT NULL DEFAULT 'ACCEPTED',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Driver_Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "type" "Notification_Type" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" "Complaint_Type" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "Complaint_Status" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_outlet_id_key" ON "Staff"("outlet_id");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_staff_id_key" ON "Staff"("staff_id");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer_Address" ADD CONSTRAINT "Customer_Address_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup_Request" ADD CONSTRAINT "Pickup_Request_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup_Request" ADD CONSTRAINT "Pickup_Request_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Customer_Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup_Request" ADD CONSTRAINT "Pickup_Request_assigned_outlet_id_fkey" FOREIGN KEY ("assigned_outlet_id") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup_Request" ADD CONSTRAINT "Pickup_Request_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickup_request_id_fkey" FOREIGN KEY ("pickup_request_id") REFERENCES "Pickup_Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_outlet_admin_id_fkey" FOREIGN KEY ("outlet_admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Item" ADD CONSTRAINT "Order_Item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Item" ADD CONSTRAINT "Order_Item_laundry_item_id_fkey" FOREIGN KEY ("laundry_item_id") REFERENCES "Laundry_Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station_Task" ADD CONSTRAINT "Station_Task_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station_Task" ADD CONSTRAINT "Station_Task_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station_Task_Item" ADD CONSTRAINT "Station_Task_Item_station_task_id_fkey" FOREIGN KEY ("station_task_id") REFERENCES "Station_Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station_Task_Item" ADD CONSTRAINT "Station_Task_Item_laundry_item_id_fkey" FOREIGN KEY ("laundry_item_id") REFERENCES "Laundry_Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bypass_Request" ADD CONSTRAINT "Bypass_Request_station_task_id_fkey" FOREIGN KEY ("station_task_id") REFERENCES "Station_Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bypass_Request" ADD CONSTRAINT "Bypass_Request_outlet_admin_id_fkey" FOREIGN KEY ("outlet_admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver_Task" ADD CONSTRAINT "Driver_Task_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver_Task" ADD CONSTRAINT "Driver_Task_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
