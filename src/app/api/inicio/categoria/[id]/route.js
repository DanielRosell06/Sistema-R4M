// src/app/api/inicio/categoria/[id]/route.js

import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

// Adicione esta linha para forçar a rota a ser dinâmica
export const dynamic = 'force-dynamic';

// DELETE para excluir uma categoria específica
export async function DELETE(request, { params }) {
    try {
        const id = Number(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ message: "ID inválido." }, { status: 400 });
        }

        // Move os produtos da categoria a ser excluída para a categoria "Sem Categoria" (ID 1)
        await prisma.produto.updateMany({
            where: { id_Categoria: id },
            data: { id_Categoria: 1 }, // ID 1 = "Sem Categoria"
        });

        // Agora exclui a categoria
        const categoriaExcluida = await prisma.categoria.delete({
            where: { id: id },
        });

        return NextResponse.json(categoriaExcluida, { status: 200 });

    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        return NextResponse.json({
            message: "Erro interno do servidor ao excluir categoria.",
            error: error.message
        }, { status: 500 });
    }
}