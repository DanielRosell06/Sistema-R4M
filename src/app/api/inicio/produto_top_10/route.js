import { prisma } from '../../../../lib/prisma';

export async function PUT(request) {
    try {
        const productsToUpdate = await request.json();
        console.log(productsToUpdate)

        if (!Array.isArray(productsToUpdate)) {
            return new Response(
                JSON.stringify({ message: "O campo 'titulo' é obrigatório." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const updateTransactions = productsToUpdate.map(p =>
            prisma.produto.update({
                where: { id: p.id },
                data: {
                    ranking_top: p.ranking_top,
                },
            })
        );

        await prisma.$transaction(updateTransactions);

        
        return new Response(
            JSON.stringify({ message: "Produtos atualizados com sucesso." }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Erro ao salvar organização:", error);
        return new Response(
            JSON.stringify({ message: "Erro ao atualizar produtos.", error: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}