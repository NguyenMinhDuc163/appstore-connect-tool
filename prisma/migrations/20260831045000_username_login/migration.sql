ALTER TABLE "User" ADD COLUMN "username" TEXT;
UPDATE "User"
SET "username" = lower(COALESCE(NULLIF(split_part("email", '@', 1), ''), 'user')) || '_' || substr(md5("id"), 1, 6);
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
