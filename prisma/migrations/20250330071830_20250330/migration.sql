-- AddForeignKey
ALTER TABLE "todoshare" ADD CONSTRAINT "todoshare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
