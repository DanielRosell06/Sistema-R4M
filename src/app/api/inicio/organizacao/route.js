// File: src/app/api/inicio/organizacao/route.js

import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

// GET para buscar TODOS os produtos para organizar
export async function GET(request) {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos para organização:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

// PUT para salvar as mudanças de categoria e ranking
export async function PUT(request) {
  try {
    const { productsToUpdate } = await request.json();

    if (!Array.isArray(productsToUpdate)) {
      return NextResponse.json({ message: "Formato inválido." }, { status: 400 });
    }

    const updateTransactions = productsToUpdate.map(p =>
      prisma.produto.update({
        where: { id: p.id },
        data: {
          id_Categoria: p.id_Categoria,
          ranking_categoria: p.ranking_categoria, // CORREÇÃO: Adicionado para salvar a ordem
        },
      })
    );

    await prisma.$transaction(updateTransactions);

    return NextResponse.json({ message: "Organização salva com sucesso!" }, { status: 200 });

  } catch (error) {
    console.error("Erro ao salvar organização:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}