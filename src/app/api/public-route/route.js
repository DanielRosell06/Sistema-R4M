import { prisma } from '../../../lib/prisma';

// Headers CORS que serão reutilizados
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const tipo = url.searchParams.get('tipo');

        let resultado;

        if (tipo == "categorias") {
            resultado = await prisma.categoria.findMany({
                orderBy: { ranking: 'asc' },
                include: { produtos: true }
            });
        }

        if (tipo == "top10") {
            resultado = await prisma.produto.findMany({
                where: {
                    ranking_top: {
                        gt: 0
                    }
                },
                orderBy: { ranking_top: 'asc' }
            });
        }

        return new Response(
            JSON.stringify(resultado),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
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
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            }
        );
    }
}

// Método OPTIONS necessário para requisições CORS preflight
export async function OPTIONS() {
    return new Response(null, {
        headers: corsHeaders
    });
}