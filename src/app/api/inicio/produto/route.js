// File: src/app/api/inicio/produto/route.js

import { prisma } from '../../../../lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
    try {
        const produtos = await prisma.produto.findMany({
            where: { status: "ativo" }
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
        const formData = await request.formData();

        const titulo = formData.get('titulo');
        const descricao = formData.getAll('descricao');
        const modo_de_uso = formData.get('modo_de_uso');
        const imagem = formData.get('imagem');

        let imagemUrl = "";

        if (imagem && imagem instanceof File && imagem.size > 0) {
            const arrayBuffer = await imagem.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "produtos-R4M",
                        resource_type: "auto"
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Erro no Cloudinary:", error);
                            reject(new Error("Falha no upload da imagem"));
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(buffer);
            });

            imagemUrl = uploadResponse.secure_url;
        }

        if (!titulo || !modo_de_uso || descricao.length === 0) {
            return new Response(
                JSON.stringify({ message: "Campos obrigatórios faltando" }),
                { status: 400 }
            );
        }

        const novoProduto = await prisma.produto.create({
            data: {
                titulo: titulo,
                descricao: JSON.stringify(descricao),
                modo_de_uso: modo_de_uso,
                // --- CORREÇÃO AQUI ---
                // Agora, novos produtos são criados sem categoria (null)
                id_Categoria: null,
                // ----
                ranking_top: 0, // Definido como 0 por padrão
                ranking_categoria: 0, // Definido como 0 por padrão
                imagem: imagemUrl,
                status: "ativo"
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

// ... as funções PUT e DELETE continuam iguais
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('idProduto'), 10);

        if (!id) {
            return new Response(
                JSON.stringify({ message: "ID do produto não fornecido" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        let response = await prisma.produto.delete({
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

export async function PUT(request) {
    try {
        const formData = await request.formData();

        const id = parseInt(formData.get('id'), 10);
        const titulo = formData.get('titulo');
        const descricao = formData.getAll('descricao');
        const modo_de_uso = formData.get('modo_de_uso');
        const imagem = formData.get('imagem');
        const produtoAtual = await prisma.produto.findUnique({
            where: { id: id }
        });

        let imagemUrl = produtoAtual ? produtoAtual.imagem : "";

        if (typeof imagem !== 'string') {
            if (imagem && imagem instanceof File && imagem.size > 0) {

                const arrayBuffer = await imagem.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const uploadResponse = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: "produtos-R4M",
                            resource_type: "auto"
                        },
                        (error, result) => {
                            if (error) {
                                console.error("Erro no Cloudinary:", error);
                                reject(new Error("Falha no upload da imagem"));
                            } else {
                                resolve(result);
                            }
                        }
                    );
                    uploadStream.end(buffer);
                });

                imagemUrl = uploadResponse.secure_url;
            }
        } else if (imagem) {
            imagemUrl = imagem;
        }

        if (!titulo || !modo_de_uso || descricao.length === 0) {
            return new Response(
                JSON.stringify({ message: "Campos obrigatórios faltando" }),
                { status: 400 }
            );
        }

        const novoProduto = await prisma.produto.update({
            data: {
                titulo: titulo,
                descricao: JSON.stringify(descricao),
                modo_de_uso: modo_de_uso,
                // id_Categoria: -1, // Manter a lógica de categoria ao editar se necessário
                imagem: imagemUrl,
                status: "ativo"
            },
            where: {
                id: id
            }
        });

        return new Response(
            JSON.stringify(novoProduto),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Erro ao criar produto:", error);
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