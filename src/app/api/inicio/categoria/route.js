// File: src/app/api/categorias/route.js

import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

// GET para buscar todas as categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { ranking: 'asc' }
    });
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar categorias" }, { status: 500 });
  }
}

// POST para criar uma nova categoria
export async function POST(request) {
  try {
    const { titulo } = await request.json();
    if (!titulo) {
      return NextResponse.json({ message: "Título é obrigatório" }, { status: 400 });
    }

    // Apenas um exemplo simples de ranking, você pode ajustar
    const maxRanking = await prisma.categoria.count();

    const novaCategoria = await prisma.categoria.create({
      data: {
        titulo,
        ranking: maxRanking + 1, // Lógica simples de ranking
        ranking_site: 0
      }
    });
    return NextResponse.json(novaCategoria, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao criar categoria" }, { status: 500 });
  }
}