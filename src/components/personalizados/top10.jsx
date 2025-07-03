"use client"

import React, { useState } from "react"
import { Plus, GripVertical, X } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

// Em JS, não temos interfaces. A estrutura dos objetos é a mesma.
const availableProducts = [
  { id: "1", name: "Smartphone Galaxy", image: "/placeholder.svg?height=60&width=60" },
  { id: "2", name: "Notebook Dell", image: "/placeholder.svg?height=60&width=60" },
  { id: "3", name: "Fone Bluetooth", image: "/placeholder.svg?height=60&width=60" },
  { id: "4", name: "Tablet iPad", image: "/placeholder.svg?height=60&width=60" },
  { id: "5", name: "Smartwatch Apple", image: "/placeholder.svg?height=60&width=60" },
  { id: "6", name: "Câmera Canon", image: "/placeholder.svg?height=60&width=60" },
  { id: "7", name: "Monitor 4K", image: "/placeholder.svg?height=60&width=60" },
  { id: "8", name: "Teclado Mecânico", image: "/placeholder.svg?height=60&width=60" },
  { id: "9", name: "Mouse Gamer", image: "/placeholder.svg?height=60&width=60" },
  { id: "10", name: "Webcam HD", image: "/placeholder.svg?height=60&width=60" },
  { id: "11", name: "Caixa de Som", image: "/placeholder.svg?height=60&width=60" },
  { id: "12", name: "Carregador Wireless", image: "/placeholder.svg?height=60&width=60" },
]

export default function ProductManager() {
  // As anotações de tipo <...> são removidas dos hooks do useState
  const [selectedProducts, setSelectedProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // As anotações de tipo dos parâmetros das funções são removidas
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

    setSelectedProducts(newProducts)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleSave = () => {
    console.log("Produtos salvos:", selectedProducts)
    alert(`${selectedProducts.length} produtos salvos com sucesso!`)
  }

  const isMaxReached = selectedProducts.length >= 10

  return (
    <div className="min-h-screen bg-stone-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Botão de adicionar */}
        <div className="mb-6">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={isMaxReached}
                className={`w-12 h-12 rounded-full ${
                  isMaxReached ? "bg-gray-500 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
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
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="text-white">{product.name}</span>
                        </div>
                        <Button
                          onClick={() => addProduct(product)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1"
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
            <h2 className="text-white text-lg font-semibold">⭐Top 10 ({selectedProducts.length}/10)</h2>
          </div>

          {selectedProducts.length === 0 ? (
            <div className="text-stone-400 text-center py-8">Nenhum produto selecionado</div>
          ) : (
            <div
              className="space-y-2"
              onDragLeave={() => setDragOverIndex(null)}
            >
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
                    className={`flex items-center justify-between p-3 bg-stone-700 rounded-lg cursor-move transition-all duration-200 ${
                      draggedIndex === index ? "opacity-50 scale-95 shadow-lg" : "hover:bg-stone-600"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-5 h-5 text-stone-400" />
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <span className="text-white">{product.name}</span>
                    </div>
                    <Button
                      onClick={() => removeProduct(product.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
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

        {/* Botão de salvar */}
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