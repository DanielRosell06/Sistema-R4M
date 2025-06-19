'use client'

import React, { useEffect } from 'react';
import { Input } from "../../../components/ui/input"
import Produto from "../../../components/personalizados/produto"
import { useState } from 'react';
import Modal from "../../../components/personalizados/modal"
import { data } from 'autoprefixer';
import { Skeleton } from "../../..//components/ui/skeleton"

export default function ProdutosPage() {

    // MODALS
    const [editModal, setEditModal] = useState(false)
    const [createModal, setCreateModal] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)

    //LOADING PRODITUOS
    const [produtos, setProdutos] = useState([])
    const [reloadVar, setReloadVar] = useState(-1)
    const [loading, setLoading] = useState(true)

    const reloadProdutos = () => {
        setLoading(true)
        setReloadVar(prev => prev * -1)
    };

    useEffect(() => {
        async function loadProdutos() {
            try {
                const res = await fetch("/api/inicio/produto", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                if (!res.ok) throw new Error("Erro na resposta da API");

                const data = await res.json(); // Extrai os dados da resposta

                const produtosProcessados = data.map(produto => ({
                    ...produto,
                    descricao: produto.descricao
                        ? JSON.parse(produto.descricao)   // Converte a string para array
                        : []                             // Fallback para array vazio
                }));

                setProdutos(produtosProcessados);
                setLoading(false)
                console.log(produtosProcessados);

            } catch (err) {
                console.error("Erro ao carregar produtos:", err);
            }
        }

        loadProdutos();
    }, [reloadVar])


    // EXCLUINDO PRODUTOS
    const [IdExcluir, setIdExcluir] = useState(-1)

    async function handleDeleteProduto() {
        try {
            const res = await fetch(`/api/inicio/produto?idProduto=${IdExcluir}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            if (res.ok) {
                setIdExcluir(-1)
                reloadProdutos()
                setDeleteModal(false)
                // Atualize a lista de produtos aqui se necessário
            } else {
                // Trate erros de API
                alert("Erro ao excluir produto");
            }
        } catch (err) {
            alert("Erro ao excluir produto");
        }
    }


    // CRIANDO PRODUTOS
    const [usoFields, setUsoFields] = useState([""])
    const [titulo, setTitulo] = useState("");
    const [modoUso, setModoUso] = useState("");
    const [imagemProduto, setImagemProduto] = useState("");

    async function handleCreateProduto() {
        try {
            // Cria um novo objeto FormData
            const formData = new FormData();

            // Adiciona os campos ao FormData
            formData.append('titulo', titulo);

            // Para campos array (descricao), adiciona cada item separadamente
            usoFields.forEach((field, index) => {
                formData.append('descricao', field);
            });

            formData.append('modo_de_uso', modoUso);

            // Adiciona a imagem como arquivo (se existir)
            if (imagemProduto) {
                formData.append('imagem', imagemProduto);
            }

            // Envia o FormData
            const res = await fetch("/api/inicio/produto", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                setCreateModal(false);
                setTitulo("");
                setModoUso("");
                setUsoFields([""]);

                setImagemProduto("");

                reloadProdutos()
            } else {
                // Trate erros de API com mais detalhes
                const errorData = await res.json();
                alert(`Erro ao criar produto: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            alert(`Erro ao criar produto: ${err.message}`);
        }
    }


    // EDITANDO PRODUTOS



    return (
        <div className="min-h-screen bg-stone-900 text-gray-100">
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

                {loading ?
                    <div className="mt-4 flex flex-col space-y-4">
                        <Skeleton className=" h-12 w-full rounded-br-lg bg-[#433636]" />
                        <Skeleton className=" h-12 w-full rounded-br-lg bg-[#433636]" />
                        <Skeleton className=" h-12 w-full rounded-br-lg bg-[#433636]" />
                        <Skeleton className=" h-12 w-full rounded-br-lg bg-[#433636]" />
                    </div>
                    :
                    produtos.map((produto, idx) => (
                        <Produto
                            onClickRemove={() => {
                                console.log(produto.id)
                                setIdExcluir(produto.id)
                                setDeleteModal(true)
                            }}
                            onClickEdit={() => {
                                setEditModal(true)
                                setUsoFields(produto.descricao)
                                setTitulo(produto.titulo)
                                setModoUso(produto.modo_de_uso)
                                setImagemProduto(produto.imagem)
                            }}
                            key={idx}
                            titulo={produto.titulo}
                            imagemURL={produto.imagem}
                            descricao={produto.descricao}
                            modoUso={produto.modo_de_uso}
                        />
                    ))}
            </div>
            {
                createModal ?
                    <Modal titulo="Adicionar Produto">
                        <form onSubmit={e => e.preventDefault()}>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-200">Título</label>
                                <Input
                                    type="text"
                                    className="w-full"
                                    placeholder="Nome do produto"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-200">Imagem</label>
                                <div className="relative">
                                    <Input
                                        className="h-[50px] file:mr-2 file:h-9 file:py-2 file:px-3 file:rounded-md file:border-0 hover:file:cursor-pointer file:text-sm file:font-medium file:bg-orange-400 file:text-white hover:file:bg-orange-600 cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors pr-9"
                                        type="file"
                                        id="file-input"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const fileName = e.target.files[0]?.name || "";
                                            document.getElementById("remove-btn").style.display = fileName ? "block" : "none";
                                            setImagemProduto(e.target.files[0]);
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
                                <label className="block mb-1 text-gray-200">Modo de Uso</label>
                                <textarea
                                    className="w-full rounded border border-stone-700 bg-stone-900 text-gray-100 p-2"
                                    rows={3}
                                    placeholder="Modo de uso do produto"
                                    value={modoUso}
                                    onChange={e => setModoUso(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 text-gray-200 ">Especificações Técnicas</label>
                                {[...Array(usoFields?.length || 0)].map((_, i) => (
                                    <div
                                        className="flex flex-row justify-between"
                                        key={i}>
                                        <Input
                                            type="text"
                                            className="w-[88%] mb-2"
                                            placeholder={`Especificação #${i + 1}`}
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
                                            title="Remover especificação"
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
                                    + Adicionar epsecificação
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
                                    type="button"
                                    className="px-4 py-2 rounded bg-orange-400 text-white hover:bg-orange-600"
                                    onClick={() => {
                                        handleCreateProduto()
                                    }}
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
                            <Input
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                type="text" className="w-full" placeholder="Nome do produto"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-200">Imagem</label>
                            <div className='flex'>
                                <div>
                                    {imagemProduto != "" ?
                                        typeof imagemProduto === "string" ?
                                            <img className='h-32' src={imagemProduto}></img>
                                            :
                                            <div className=' border-2 p-2 rounded-sm h-full border-dashed border-gray-300'>
                                                <p className="text-sm text-white">Nova Imagem: {imagemProduto.name}</p>
                                            </div>
                                        :
                                        <h1 className='text-sm text-stone-500'>O produto ainda não possui imagem</h1>
                                    }
                                </div>
                                <div className="relative">
                                    <label
                                        htmlFor="edit-file-input"
                                        className=" ml-4 p-4 flex items-center justify-center h-[50px] w-44 bg-orange-400 hover:bg-orange-600 text-white text-sm font-medium cursor-pointer rounded-md transition-colors"
                                    >
                                        Clique aqui para alterar a imagem
                                        <input
                                            type="file"
                                            id="edit-file-input"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const fileName = e.target.files[0]?.name || "";
                                                setImagemProduto(e.target.files[0]);
                                            }}
                                        />
                                    </label>
                                    {imagemProduto != "" ?
                                        <button
                                            id="edit-remove-btn"
                                            onClick={e => {
                                                e.preventDefault();
                                                const fileInput = document.getElementById("edit-file-input");
                                                fileInput.value = "";
                                                document.getElementById("edit-remove-btn").style.display = "none";
                                                setImagemProduto("")
                                            }}
                                            className="mt-4 ml-4 p-2 bg-gray-600 rounded-sm hover:bg-red-500 transition-all "
                                            aria-label="Remover arquivo"
                                        >
                                            Remover Imagem
                                        </button>
                                        : ""
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-200">Modo de Uso</label>
                            <textarea
                                value={modoUso}
                                onChange={(e) => setModoUso(e.target.value)}
                                className="w-full rounded border border-stone-700 bg-stone-900 text-gray-100 p-2" rows={3} placeholder="Modo de uso do produto"></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-200 ">Especificações</label>
                            {[...Array(usoFields?.length || 0)].map((_, i) => (
                                <div
                                    className="flex flex-row justify-between"
                                    key={i}>
                                    <Input
                                        type="text"
                                        className="w-[88%] mb-2"
                                        placeholder={`Especificação #${i + 1}`}
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
                                        title="Remover especificação"
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
                                + Adicionar especificação
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