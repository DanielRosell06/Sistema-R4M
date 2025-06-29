-- AlterTable
ALTER TABLE "Produto" ALTER COLUMN "id_Categoria" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_id_Categoria_fkey" FOREIGN KEY ("id_Categoria") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
