
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
    try {
        const produtos = await prisma.produto.findMany({
            where: {status : "ativo"}
        });

        return new Response(
            JSON.stringify(produtos),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return new Response(
            JSON.stringify({ message: "Erro interno do servidor." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        console.log(data)

        /*
        model Produto {
            id                Int       @id @default(autoincrement())
            titulo            String
            descricao         Json
            modo_de_uso       String
            id_Categoria      Int
            ranking_top       Int
            ranking_categoria Int
            status            String    @default("ativo")
            imagem            String
            Categoria         Categoria @relation(fields: [id_Categoria], references: [id])
        }
        */

        const novoProduto = await prisma.produto.create({
            data: {
                titulo: data.titulo,
                descricao: JSON.stringify(data.descricao),
                modo_de_uso: data.modo_de_uso,
                id_Categoria: -1,
                ranking_top: -1,
                ranking_categoria: -1,
                imagem: '',
                // Adicione outros campos conforme necessário
            }
        });

        return new Response(
            JSON.stringify(novoProduto),
            {
                status: 201,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        return new Response(
            JSON.stringify({ message: "Erro interno do servidor." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('idProduto'), 10) ;

        if (!id) {
            return new Response(
                JSON.stringify({ message: "ID do produto não fornecido" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        let response = await prisma.produto.update({
            data: { status: "inativo" },
            where: { id: id }
        })

        return new Response(
            JSON.stringify({ response }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return new Response(
            JSON.stringify({ message: "Erro interno do servidor." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}