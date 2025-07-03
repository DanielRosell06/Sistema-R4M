"use client"

import { useState } from "react"
import { GripVertical } from "lucide-react"
import { Card } from "../ui/card"
import { useEffect } from "react"

export default function DraggableList() {
    const [items, setItems] = useState([])

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await fetch("/api/inicio/categoria", { method: "GET" })
                if (!res.ok) {
                    throw new Error(`Erro HTTP: ${res.status}`)
                }
                let data = await res.json()
                data = data.filter(item => item.titulo !== "Sem Categoria")
                setItems(data)
            } catch (err) {
                console.error("Erro ao buscar categorias:", err)
                // Opcional: mostrar mensagem de erro para o usuário
            }
        }
        fetchCategorias()
    }, [])

    const [draggedItem, setDraggedItem] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    // Função para calcular como a lista ficará durante o drag
    const getReorganizedItems = () => {
        if (!draggedItem || dragOverIndex === null) {
            return items
        }

        const dragIndex = items.findIndex((item) => item.id === draggedItem.id)
        const newItems = [...items]

        // Remove o item sendo arrastado
        const [removed] = newItems.splice(dragIndex, 1)

        // Insere na nova posição
        newItems.splice(dragOverIndex, 0, removed)

        // Atualiza os rankings
        return newItems.map((item, index) => ({
            ...item,
            ranking: index + 1,
        }))
    }

    const displayItems = draggedItem ? getReorganizedItems() : items

    const handleDragStart = (e, item) => {
        setDraggedItem(item)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/html", "")
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"

        if (draggedItem) {
            setDragOverIndex(index)
        }
    }

    const handleDragEnter = (e, index) => {
        e.preventDefault()
        if (draggedItem) {
            setDragOverIndex(index)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()

        if (!draggedItem || dragOverIndex === null) return

        // Aplica a reorganização final
        const finalItems = getReorganizedItems()
        setItems(finalItems)

        // Reset states
        setDraggedItem(null)
        setDragOverIndex(null)
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
        setDragOverIndex(null)
    }

    return (
        <div className="w-[42%] mx-auto p-6 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Lista Ordenável</h1>
            <p className="text-gray-400 text-center mb-6">
                Arraste os itens usando o ícone à esquerda para reordenar a lista
            </p>

            <div className="space-y-2">
                {displayItems.map((item, index) => {
                    const isDragging = draggedItem?.id === item.id
                    const isDropZone = dragOverIndex === index && draggedItem?.id !== item.id

                    return (
                        <div key={item.id}>
                            {/* Placeholder para mostrar onde o item será inserido */}
                            {isDropZone && (
                                <div className="h-16 border-2 border-dashed border-orange-500 bg-orange-500/10 rounded-lg mb-2 flex items-center justify-center">
                                    <span className="text-orange-500 text-sm font-medium">Solte aqui (Ranking {item.ranking})</span>
                                </div>
                            )}

                            <Card
                                className={`
                  p-4 transition-all duration-200 cursor-move bg-stone-800 border-stone-800 hover:border-orange-500/50
                  ${isDragging ? "opacity-30 scale-95 rotate-2 shadow-lg shadow-orange-500/20" : ""}
                  ${isDropZone ? "transform translate-y-2" : ""}
                `}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-white">{item.titulo}</h3>
                                        </div>

                                        <div className="text-right">
                                            <div
                                                className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all
                        ${isDragging ? "bg-gray-600 text-gray-400" : "bg-orange-500 text-white"}
                      `}
                                            >
                                                {item.ranking}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Ranking</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}