'use client'

import React from 'react';
import { Button } from '../ui/button';
import { useState } from 'react';


export default function Produto({ titulo, imagemURL, descricao, modoUso, onClickRemove, onClickEdit }) {

    const [aberto, setAberto] = useState(false);

    return (
        <>
            <div
                className={(aberto ? "rounded-b-none" : "rounded-b-lg") + " mt-4 flex h-12 bg-stone-800 text-gray-100 rounded-t-lg pl-8 transition-colors hover:bg-[#24201b]"}
            >
                <div className='flex justify-between w-full'>
                    <div className='flex '>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2 mt-auto mb-auto"
                            aria-label="Expandir"
                            onClick={() => {
                                console.log('oi')
                                if (aberto) {
                                    setAberto(false)
                                } else {
                                    setAberto(true)
                                }
                            }}
                        >
                            {!aberto ?
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            }
                        </Button>
                        <h1 className='mr-4 mt-auto mb-auto'>{titulo}</h1>
                    </div>
                    <div className='mt-auto mb-auto mr-2'>
                        <Button variant="ghost" size="icon" className="mr-2 hover:bg-blue-400 text-blue-400 hover:text-white" aria-label="Editar"
                            onClick={() => { onClickEdit() }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 3.487a2.25 2.25 0 113.182 3.182l-9.193 9.193a2 2 0 01-.878.513l-3.193.957.957-3.193a2 2 0 01.513-.878l9.193-9.193z" />
                            </svg>
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Excluir" className="hover:bg-red-400 text-red-400 hover:text-white"
                            onClick={() => { onClickRemove() }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
            {aberto && (
                <div className='flex h-[230px] bg-[#24201b] text-gray-100 rounded-b-lg pl-8 transition-colors w-full'>
                    <div className="flex justify-between mt-4 ml-auto mr-auto w-full">
                        <div className='w-[30%]'>
                            <h1 className='mb-2'>Imagem:</h1>
                            {imagemURL == "" ? 
                            <h1 className='text-sm text-stone-400'>Este produto ainda não possui imagem.</h1> 
                            :

                                <img
                                    src={imagemURL}
                                    alt="Logo"
                                    className='mr-10'
                                    style={{ maxWidth: '300px', maxHeight: '160px', objectFit: 'contain' }}
                                />
                            }
                        </div>
                        <div className='w-[30%]'>
                            <h1 className='mb-2'>Especificações:</h1>
                            <ul className=" list-disc pl-5 text-sm">
                                {descricao.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-[30%] text-sm">
                            <h1 className='mb-2'>Modo de uso:</h1>
                            {modoUso}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}