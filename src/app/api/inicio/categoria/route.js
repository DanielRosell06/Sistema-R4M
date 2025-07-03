// File: src/app/api/categorias/route.js

import { prisma } from '../../../../lib/prisma';

// GET para buscar todas as categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { ranking: 'asc' }
    });

    return new Response(
      JSON.stringify(categorias),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro ao pedir categorias do banco:", error);
    return new Response(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// POST para criar uma nova categoria
export async function POST(request) {
  try {
    const { titulo } = await request.json();
    if (!titulo) {
      return new Response(
        JSON.stringify({ message: "O campo 'titulo' é obrigatório." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Apenas um exemplo simples de ranking, você pode ajustar
    const maxRanking = await prisma.categoria.count();

    const novaCategoria = await prisma.categoria.create({
      data: {
        titulo,
        ranking: maxRanking + 1, // Lógica simples de ranking
      }
    });
    return new Response(
      JSON.stringify(novaCategoria),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return new Response(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}