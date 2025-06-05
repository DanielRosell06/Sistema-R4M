'use client'

import React from 'react';
import Link from 'next/link';
import { Input } from "../../components/ui/input"
import Produto from "../../components/personalizados/produto"
// Make sure Produto is exported as a named export from the referenced file.


export default function ProdutosPage() {
    const produtos = [
        {
            titulo: "Polidor Corte Rápido",
            imagemURL: "/images/logo.png",
            descricao: [
                "Remove riscos profundos e marcas de lixa.",
                "Ideal para o primeiro passo do polimento."
            ],
            modoUso: "Aplique uma pequena quantidade na boina de lã e trabalhe em pequenas áreas até o brilho aparecer."
        },
        {
            titulo: "Polidor Refino",
            imagemURL: "/images/logo.png",
            descricao: [
                "Remove micro riscos e marcas do polidor de corte.",
                "Proporciona acabamento uniforme."
            ],
            modoUso: "Utilize com boina de espuma macia, espalhe o produto e trabalhe até o acabamento desejado."
        },
        {
            titulo: "Polidor Lustro",
            imagemURL: "/images/logo.png",
            descricao: [
                "Realça o brilho e elimina hologramas.",
                "Indicado para o toque final."
            ],
            modoUso: "Aplique com boina super macia, em movimentos circulares, até obter brilho intenso."
        },
        {
            titulo: "Polidor 3 em 1",
            imagemURL: "/images/logo.png",
            descricao: [
                "Corta, refina e lustra em um único produto.",
                "Prático para polimentos rápidos."
            ],
            modoUso: "Aplique na superfície limpa, use boina apropriada e trabalhe conforme necessidade."
        },
        {
            titulo: "Polidor Antirresíduo",
            imagemURL: "/images/logo.png",
            descricao: [
                "Remove resíduos de polidores anteriores.",
                "Prepara a superfície para proteção."
            ],
            modoUso: "Pulverize sobre a superfície e remova com pano de microfibra limpo."
        }
    ];

    return (
        <div className="min-h-screen bg-stone-900 text-gray-100">
            <nav className="flex justify-between p-4 bg-stone-800 mb-8">
                <div>
                    <h1 className='text-xl font-bold'>R4M<span className='ml-1 text-orange-400'>Polidores</span></h1>
                </div>
                <div>
                    <Link
                        href="/"
                        className="mr-6 transition-colors hover:text-orange-400"
                    >
                        Produtos
                    </Link>
                    <a
                        href="/produtos"
                        className="mr-6 transition-colors hover:text-orange-400"
                    >
                        Organização
                    </a>
                    <a
                        href="/contato"
                        className="transition-colors hover:text-orange-400"
                    >
                        Usuários
                    </a>
                </div>
            </nav>
            <div className='p-8 w-full'>
                <h1 className='text-3xl ml-24'>Produtos</h1>
                <p className="ml-24 mt-2 max-w-2xl text-gray-300">
                    Nesta página, você pode criar e remover produtos, além de escolher e editar fotos, descrição, especificações técnicas e modo de uso de cada produto.
                </p>

                <div className="flex items-center gap-4 mt-8">
                    <button className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                        + Adicionar produto
                    </button>
                    <div className="relative w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            {/* Ícone de pesquisa SVG */}
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <Input
                            type="text"
                            placeholder="Pesquisar produto..."
                            className="pl-10 w-full rounded border border-stone-700 bg-stone-800 text-gray-100 focus:border-orange-400 focus:ring-0"
                        />
                    </div>
                </div>

                {produtos.map((produto, idx) => (
                    <Produto
                        key={idx}
                        titulo={produto.titulo}
                        imagemURL={produto.imagemURL}
                        descricao={produto.descricao}
                        modoUso={produto.modoUso}
                    />
                ))}
            </div>
        </div>
    );
}