'use client'

import React from 'react';
import Link from 'next/link';
import { Input } from "../../components/ui/input"
import Produto from "../../components/personalizados/produto"
import { useState } from 'react';
import Modal from "../../components/personalizados/modal"
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

    const [createModal, setCreateModal] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const [usoFields, setUsoFields] = useState([""])

    const handleDeleteProduto = () => {
        return
    }

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
                    <button
                        className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors hover:cursor-pointer"
                        onClick={() => setCreateModal(true)}
                    >
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
                        onClickRemove={() => {
                            setDeleteModal(true)
                        }}
                        onClickEdit={() => {
                            setEditModal(true)
                        }}
                        key={idx}
                        titulo={produto.titulo}
                        imagemURL={produto.imagemURL}
                        descricao={produto.descricao}
                        modoUso={produto.modoUso}
                    />
                ))}
            </div>
            {
                createModal ?
                    <Modal titulo="Adicionar Produto">
                        <form>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-200">Título</label>
                                <Input type="text" className="w-full" placeholder="Nome do produto" />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-200">Imagem</label>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        id="file-input"
                                        className="h-[50px] file:mr-2 file:h-9 file:py-2 file:px-3 file:rounded-md file:border-0 hover:file:cursor-pointer file:text-sm file:font-medium file:bg-orange-400 file:text-white hover:file:bg-orange-600 cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors pr-9"
                                        onChange={(e) => {
                                            const fileName = e.target.files[0]?.name || "";
                                            document.getElementById("remove-btn").style.display = fileName ? "block" : "none";
                                            setImagemEvento(e.target.files[0]);
                                        }}
                                    />

                                    <button
                                        id="remove-btn"
                                        onClick={() => {
                                            event.preventDefault();
                                            const fileInput = document.getElementById("file-input");
                                            fileInput.value = "";
                                            document.getElementById("remove-btn").style.display = "none";
                                        }}
                                        className=" mt-[10px] hidden absolute top-1 right-1 bg-red-500/0 text-red-500 rounded-md p-1 hover:bg-red-600 hover:text-white transition-colors mr-2"
                                        aria-label="Remover arquivo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-200">Descrição</label>
                                <textarea className="w-full rounded border border-stone-700 bg-stone-900 text-gray-100 p-2" rows={3} placeholder="Descrição do produto"></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-200 ">Modo de Uso</label>
                                {[...Array(usoFields?.length || 0)].map((_, i) => (
                                    <div
                                        className="flex flex-row justify-between"
                                        key={i}>
                                        <Input
                                            type="text"
                                            className="w-[88%] mb-2"
                                            placeholder={`Modo de uso #${i + 1}`}
                                            value={usoFields[i]}
                                            onChange={e => {
                                                const updated = [...usoFields];
                                                updated[i] = e.target.value;
                                                setUsoFields(updated);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="flex items-center justify-center text-red-400 hover:text-white hover:bg-red-400 transition-all rounded h-9 w-9"
                                            onClick={() => {
                                                const updated = usoFields.filter((_, idx) => idx !== i);
                                                setUsoFields(updated);
                                            }}
                                            title="Remover modo de uso"
                                        >
                                            {/* Ícone de lixeira SVG */}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className={(usoFields.length >= 8 ? "bg-stone-700 text-stone-500" : "bg-orange-400 text-white hover:bg-orange-600") + (" px-3 py-1 rounded  text-sm hover:cursor-pointer")}
                                    disabled={usoFields.length >= 8}
                                    onClick={() => {
                                        if (usoFields.length < 8) setUsoFields([...usoFields, ""]);
                                    }}
                                >
                                    + Adicionar modo de uso
                                </button>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                                    onClick={() => {
                                        setCreateModal(false)
                                        setUsoFields([""])
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-orange-400 text-white hover:bg-orange-600"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </Modal>
                    : ""
            }
            {
                deleteModal &&
                <Modal titulo="Excluir Produto">
                    <div className="mb-6">
                        <p className="text-lg text-gray-200">Tem certeza que deseja excluir este produto?</p>
                        <p className="text-sm text-gray-400 mt-2">Esta ação não poderá ser desfeita.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                            onClick={() => setDeleteModal(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                            onClick={handleDeleteProduto}
                        >
                            Excluir
                        </button>
                    </div>
                </Modal>
            }
            {
                editModal &&
                <Modal titulo="Editar Produto">
                    <form>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-200">Título</label>
                            <Input type="text" className="w-full" placeholder="Nome do produto" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-200">Imagem</label>
                            <div className="relative">
                                <Input
                                    type="file"
                                    id="edit-file-input"
                                    className="h-[50px] file:mr-2 file:h-9 file:py-2 file:px-3 file:rounded-md file:border-0 hover:file:cursor-pointer file:text-sm file:font-medium file:bg-orange-400 file:text-white hover:file:bg-orange-600 cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors pr-9"
                                />
                                <button
                                    id="edit-remove-btn"
                                    onClick={e => {
                                        e.preventDefault();
                                        const fileInput = document.getElementById("edit-file-input");
                                        fileInput.value = "";
                                        document.getElementById("edit-remove-btn").style.display = "none";
                                    }}
                                    className=" mt-[10px] hidden absolute top-1 right-1 bg-red-500/0 text-red-500 rounded-md p-1 hover:bg-red-600 hover:text-white transition-colors mr-2"
                                    aria-label="Remover arquivo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-200">Descrição</label>
                            <textarea className="w-full rounded border border-stone-700 bg-stone-900 text-gray-100 p-2" rows={3} placeholder="Descrição do produto"></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-200 ">Modo de Uso</label>
                            {[...Array(usoFields?.length || 0)].map((_, i) => (
                                <div
                                    className="flex flex-row justify-between"
                                    key={i}>
                                    <Input
                                        type="text"
                                        className="w-[88%] mb-2"
                                        placeholder={`Modo de uso #${i + 1}`}
                                        value={usoFields[i]}
                                        onChange={e => {
                                            const updated = [...usoFields];
                                            updated[i] = e.target.value;
                                            setUsoFields(updated);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="flex items-center justify-center text-red-400 hover:text-white hover:bg-red-400 transition-all rounded h-9 w-9"
                                        onClick={() => {
                                            const updated = usoFields.filter((_, idx) => idx !== i);
                                            setUsoFields(updated);
                                        }}
                                        title="Remover modo de uso"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className={(usoFields.length >= 8 ? "bg-stone-700 text-stone-500" : "bg-orange-400 text-white hover:bg-orange-600") + (" px-3 py-1 rounded  text-sm hover:cursor-pointer")}
                                disabled={usoFields.length >= 8}
                                onClick={() => {
                                    if (usoFields.length < 8) setUsoFields([...usoFields, ""]);
                                }}
                            >
                                + Adicionar modo de uso
                            </button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                                onClick={() => {
                                    setEditModal(false)
                                    setUsoFields([""])
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded bg-orange-400 text-white hover:bg-orange-600"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            }
        </div >

    );
}