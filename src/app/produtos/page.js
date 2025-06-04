import React from 'react';

export default function ProdutosPage() {
    return (
        <div className="min-h-screen bg-stone-900 text-gray-100">
            <nav className="p-4 bg-stone-800 mb-8">
                <a
                    href="/"
                    className="mr-4 transition-colors hover:text-orange-400"
                >
                    Home
                </a>
                <a
                    href="/produtos"
                    className="mr-4 transition-colors hover:text-orange-400"
                >
                    Produtos
                </a>
                <a
                    href="/contato"
                    className="transition-colors hover:text-orange-400"
                >
                    Contato
                </a>
            </nav>
            <h1 className="text-2xl font-bold mb-2">Produtos</h1>
            <p>Bem-vindo à página de produtos!</p>
        </div>
    );
}