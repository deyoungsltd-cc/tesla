-- CreateTable
CREATE TABLE "tesla_vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specs" JSONB NOT NULL,
    "colors" JSONB NOT NULL,
    "interior" TEXT NOT NULL DEFAULT 'Premium Black',
    "estimated_delivery" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tesla_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "selected_color" TEXT NOT NULL DEFAULT 'pearl_white',
    "selected_interior" TEXT NOT NULL DEFAULT 'Premium Black',
    "total_price" DOUBLE PRECISION NOT NULL,
    "deposit_amount" DOUBLE PRECISION NOT NULL,
    "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "order_number" TEXT NOT NULL,
    "tracking_info" JSONB,
    "notes" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tesla_vehicles_slug_key" ON "tesla_vehicles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_orders_order_number_key" ON "vehicle_orders"("order_number");

-- CreateIndex
CREATE INDEX "idx_vehicle_order_user" ON "vehicle_orders"("user_id");

-- CreateIndex
CREATE INDEX "idx_vehicle_order_status" ON "vehicle_orders"("status");

-- AddForeignKey
ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "tesla_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
