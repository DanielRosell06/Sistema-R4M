// File: src/app/api/categorias/[id]/route.js

import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

// DELETE para remover uma categoria
export async function DELETE(request, { params }) {
  try {
    const id = Number(params.id);

    // Verifica se a categoria está vazia
    const produtosNaCategoria = await prisma.produto.count({
      where: { id_Categoria: id },
    });

    if (produtosNaCategoria > 0) {
      return NextResponse.json({ message: "Não é possível excluir. A categoria contém produtos." }, { status: 400 });
    }

    await prisma.categoria.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Categoria excluída com sucesso" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao excluir categoria" }, { status: 500 });
  }
}