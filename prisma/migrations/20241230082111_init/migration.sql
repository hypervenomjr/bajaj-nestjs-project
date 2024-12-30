-- CreateTable
CREATE TABLE "vouchers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "applicableProducts" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "minCartValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "allowedUsers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "redeemableDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_vouchers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "voucherId" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "useCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_vouchers_userId_voucherId_key" ON "user_vouchers"("userId", "voucherId");

-- AddForeignKey
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
