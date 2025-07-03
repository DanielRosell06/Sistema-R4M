"use client"

import React, { useState, useEffect } from "react" // Importei o useEffect
import { Plus, GripVertical, X } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

export default function ProductManager() {
  const [availableProducts, setAvailableProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [flag, setFlag] = useState(false)

  useEffect(() => {
    fetch("/api/inicio/produto")
      .then((res) => res.json())
      .then((data) => setAvailableProducts(data))
      .catch(() => setAvailableProducts([]))
  }, [])

  useEffect(() => {
    if (flag) {
      console.log(availableProducts)
      const initiallySelected = availableProducts
        .filter((product) => product.ranking_top >= 1)
        .sort((a, b) => a.ranking_top - b.ranking_top)
      setSelectedProducts(initiallySelected)
    }
    setFlag(true)
  }, [availableProducts])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // ✅ PONTO 1: EFEITO PARA ATUALIZAR O RANKING
  // Este useEffect é acionado sempre que a lista `selectedProducts` muda.
  useEffect(() => {
    // Mapeamos a lista para criar uma nova com a propriedade `ranking_top` atualizada.
    const updatedProducts = selectedProducts.map((product, index) => ({
      ...product,
      ranking_top: index + 1, // A posição é o índice do array + 1
    }))

    // Verificamos se há necessidade de atualização para evitar loops infinitos de renderização.
    if (JSON.stringify(updatedProducts) !== JSON.stringify(selectedProducts)) {
      setSelectedProducts(updatedProducts)
    }
  }, [selectedProducts]) // O array de dependência garante que o efeito rode apenas quando a lista mudar.

  const addProduct = (product) => {
    if (selectedProducts.length < 10 && !selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnter = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== null) {
      setDragOverIndex(index)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newProducts = [...selectedProducts]
    const [draggedProduct] = newProducts.splice(draggedIndex, 1)

    newProducts.splice(dropIndex, 0, draggedProduct)

    setSelectedProducts(newProducts) // A atualização do estado aqui acionará o useEffect do ranking
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleSave = () => {
    console.log(selectedProducts)
    const saveTop10 = async () => {
      try {
        const body = JSON.stringify([
          ...selectedProducts,
          ...availableProducts.filter(
            (p) => !selectedProducts.find((sp) => sp.id === p.id)
          ),
        ])
        const res = await fetch("/api/inicio/produto_top_10", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        })
        if (!res.ok) throw new Error("Erro ao salvar o Top 10")
        await res.json()
        
      } catch (err) {
        alert("Erro ao salvar o Top 10")
      }
    }
    saveTop10()
  }

  const isMaxReached = selectedProducts.length >= 10

  return (
    <div className="min-h-screen bg-stone-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Botão de adicionar (sem alterações) */}
        <div className="mb-6">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={isMaxReached}
                className={`w-12 h-12 rounded-full ${isMaxReached ? "bg-gray-500 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                  } text-white font-bold text-xl`}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-stone-800 border-stone-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Produtos</DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {availableProducts
                    .filter((product) => !selectedProducts.find((p) => p.id === product.id))
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-stone-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {product.imagem == "" ?
                            <div className="w-10 h-10 rounded object-cover bg-stone-600">
                            </div>
                            :
                            <img
                              src={product.imagem}
                              alt={product.titulo}
                              className="w-10 h-10 rounded object-cover"
                            />
                          }
                          <span className="text-white">{product.titulo}</span>
                        </div>
                        <Button
                          onClick={() => addProduct(product)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 ml-3"
                          disabled={isMaxReached}
                        >
                          Adicionar +
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de produtos selecionados */}
        <div className="bg-stone-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">⭐ Top 10 ({selectedProducts.length}/10)</h2>
          </div>

          {selectedProducts.length === 0 ? (
            <div className="text-stone-400 text-center py-8">Nenhum produto no Top 10</div>
          ) : (
            <div className="space-y-2" onDragLeave={() => setDragOverIndex(null)}>
              {selectedProducts.map((product, index) => (
                <React.Fragment key={product.id}>
                  {dragOverIndex === index && draggedIndex !== index && (
                    <div className="h-12 bg-orange-500/20 rounded-lg border-2 border-dashed border-orange-500 transition-all" />
                  )}

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 bg-stone-700 rounded-lg cursor-move transition-all duration-200 ${draggedIndex === index ? "opacity-50 scale-95 shadow-lg" : "hover:bg-stone-600"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-5 h-5 text-stone-400" />
                      {product.imagem == "" ?
                        <div className="w-12 h-12 rounded object-cover bg-stone-600">
                        </div>
                        :
                        <img
                          src={product.imagem}
                          alt={product.titulo}
                          className="w-12 h-12 rounded object-cover"
                        />
                      }
                      <span className="text-white">{product.titulo}</span>
                    </div>

                    {/* ✅ PONTO 2: ELEMENTO DO RANKING E BOTÃO DE REMOVER */}
                    <div className="flex items-center space-x-4">
                      {/* Bolinha laranja com a posição do ranking */}
                      <div className="ml-3 flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      {/* Botão de remover */}
                      <Button
                        onClick={() => {
                          removeProduct(product.id)
                          product.ranking_top = 0
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>
                </React.Fragment>
              ))}

              <div
                className="h-4 -mt-2"
                onDragEnter={(e) => handleDragEnter(e, selectedProducts.length)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, selectedProducts.length)}
              >
                {dragOverIndex === selectedProducts.length && (
                  <div className="h-12 bg-orange-500/20 rounded-lg border-2 border-dashed border-orange-500 transition-all" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão de salvar (sem alterações) */}
        <div className="flex justify-center">
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 text-lg font-semibold"
            disabled={selectedProducts.length === 0}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}