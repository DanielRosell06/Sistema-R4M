-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "tipo" TEXT NOT NULL DEFAULT 'usuario',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" JSONB NOT NULL,
    "modo_de_uso" TEXT NOT NULL,
    "id_Categoria" INTEGER NOT NULL,
    "ranking_top" INTEGER NOT NULL,
    "ranking_categoria" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "imagem" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "ranking" INTEGER NOT NULL,
    "ranking_site" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_id_Categoria_fkey" FOREIGN KEY ("id_Categoria") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
