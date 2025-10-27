-- CreateTable
CREATE TABLE "shareableLink" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "sharedFolder" INTEGER NOT NULL,
    "linkOwner" INTEGER NOT NULL,

    CONSTRAINT "shareableLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shareableLink" ADD CONSTRAINT "shareableLink_sharedFolder_fkey" FOREIGN KEY ("sharedFolder") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shareableLink" ADD CONSTRAINT "shareableLink_linkOwner_fkey" FOREIGN KEY ("linkOwner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
