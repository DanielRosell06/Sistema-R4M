"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { motion, Reorder } from "framer-motion"
import { GripVertical, User, Save, Check } from "lucide-react"

export default function Component() {
    const [names, setNames] = useState([])
    const [initialOrder, setInitialOrder] = useState([])
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await fetch("/api/inicio/categoria", { method: "GET" })
                if (!res.ok) {
                    throw new Error(`Erro HTTP: ${res.status}`)
                }
                let data = await res.json()
                data = data.filter(item => item.titulo !== "Sem Categoria")

                // Adicionar ranking inicial se não existir
                const dataWithRanking = data.map((item, index) => ({
                    ...item,
                    ranking: item.ranking || index + 1,
                }))

                setNames(dataWithRanking)
                setInitialOrder(dataWithRanking)
            } catch (err) {
                console.error("Erro ao buscar categorias:", err)
            }
        }
        fetchCategorias()
    }, [])

    // Função para comparar se houve mudanças na ordem
    const checkForChanges = (currentNames, originalOrder) => {
        if (currentNames.length !== originalOrder.length) return true

        return currentNames.some((item, index) => {
            const originalItem = originalOrder[index]
            return item.id !== originalItem.id
        })
    }

    // Detectar mudanças quando a ordem dos nomes muda
    useEffect(() => {
        if (initialOrder.length > 0) {
            const changesDetected = checkForChanges(names, initialOrder)
            setHasChanges(changesDetected)

            // Reset do estado "salvo" quando há mudanças
            if (changesDetected) {
                setIsSaved(false)
            }
        }
    }, [names, initialOrder])

    // Atualizar ranking quando a ordem muda
    useEffect(() => {
        if (names.length > 0) {
            setNames((prevNames) =>
                prevNames.map((person, index) => ({
                    ...person,
                    ranking: index + 1,
                }))
            )
        }
    }, [names.map((n) => n.id).join(",")])

    const fetchAtualizarCategorias = async () => {
        if (!hasChanges) return

        setIsLoading(true)
        try {
            const res = await fetch("/api/inicio/categoria", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ categoriasNovas: names }),
            })

            if (!res.ok) {
                throw new Error(`Erro HTTP: ${res.status}`)
            }

            let data = await res.json()
            data = data.filter(item => item.titulo !== "Sem Categoria")

            // Atualizar estados após sucesso
            setInitialOrder(names) // Atualiza a ordem inicial com a nova ordem
            setHasChanges(false)
            setIsSaved(true)

            // Reset do estado "salvo" após 3 segundos
            setTimeout(() => {
                setIsSaved(false)
            }, 3000)

        } catch (err) {
            console.error("Erro ao atualizar categorias:", err)
            // Opcional: mostrar mensagem de erro para o usuário
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-stone-900 p-6">
            <div className="max-w-md mx-auto">
                <div className="bg-stone-800 rounded-lg p-4">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-white text-lg font-semibold">Organizar Categorias</h2>
                        </div>
                        <p className="text-stone-400 text-sm">Arraste e solte para reordenar as categorias conforme sua preferência</p>

                        <div className="pt-4">
                            <Button
                                onClick={fetchAtualizarCategorias}
                                disabled={!hasChanges || isLoading}
                                className={`w-full text-white px-4 py-2 font-semibold transition-colors ${(!hasChanges || isLoading) ? "bg-gray-500 cursor-not-allowed" :
                                        isSaved ? "bg-green-600 hover:bg-green-700" :
                                            "bg-orange-500 hover:bg-orange-600"
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                                        Salvando...
                                    </>
                                ) : isSaved ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Salvo!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {hasChanges ? "Salvar Alterações" : "Sem Alterações"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Reorder.Group axis="y" values={names} onReorder={setNames}>
                            {names.map((person, index) => (
                                <Reorder.Item key={person.id} value={person}>
                                    <motion.div
                                        className="mb-2 flex items-center gap-3 p-3 bg-stone-700 rounded-lg cursor-move transition-all duration-200 hover:bg-stone-600"
                                        whileDrag={{
                                            scale: 1.02,
                                            boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                                            zIndex: 10
                                        }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.3
                                        }}
                                        layout
                                    >
                                        <GripVertical className="w-4 h-4 text-stone-400" />
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="font-medium text-white">{person.titulo}</span>
                                        </div>
                                        <h1 className="text-sm">Posição #{person.ranking}</h1>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            </div>
        </div>
    )
}

