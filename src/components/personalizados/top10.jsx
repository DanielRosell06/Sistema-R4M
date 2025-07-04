"use client"

import React, { useState, useEffect } from "react"
import { Plus, GripVertical, X, Save, Check } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { motion, Reorder } from "framer-motion"

export default function ProductManager() {
  const [availableProducts, setAvailableProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [initialProducts, setInitialProducts] = useState([]) // Guarda a lista original
  const [hasChanges, setHasChanges] = useState(false) // Controla se há mudanças
  const [isSaved, setIsSaved] = useState(false) // Controla estado "Salvo"
  const [isLoading, setIsLoading] = useState(false) // Controla estado "Salvando"
  const [flag, setFlag] = useState(false)

  useEffect(() => {
    fetch("/api/inicio/produto")
      .then((res) => res.json())
      .then((data) => setAvailableProducts(data))
      .catch(() => setAvailableProducts([]))
  }, [])

  useEffect(() => {
    if (flag) {
      const initiallySelected = availableProducts
        .filter((product) => product.ranking_top >= 1)
        .sort((a, b) => a.ranking_top - b.ranking_top)
      
      setSelectedProducts(initiallySelected)
      // ✅ PONTO 2: DEFINE O ESTADO INICIAL QUANDO OS DADOS SÃO CARREGADOS
      setInitialProducts(initiallySelected) 
    }
    setFlag(true)
  }, [availableProducts])

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Função para comparar se houve mudanças (ordem ou produtos)
  const checkForChanges = (currentProducts, initialProducts) => {
    // Se tamanhos diferentes, houve mudança
    if (currentProducts.length !== initialProducts.length) return true
    
    // Compara se todos os produtos estão na mesma ordem
    return currentProducts.some((product, index) => {
      const initialProduct = initialProducts[index]
      return !initialProduct || product.id !== initialProduct.id
    })
  }

  // ✅ PONTO 3: EFEITO QUE COMPARA O ESTADO ATUAL COM O INICIAL
  useEffect(() => {
    if (initialProducts.length > 0 || selectedProducts.length > 0) {
      const hasChangesDetected = checkForChanges(selectedProducts, initialProducts)
      setHasChanges(hasChangesDetected)
      
      // Reset do estado "salvo" quando há mudanças
      if (hasChangesDetected) {
        setIsSaved(false)
      }
    }
  }, [selectedProducts, initialProducts])

  // Atualiza ranking quando a lista muda
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setSelectedProducts(prevProducts => 
        prevProducts.map((product, index) => ({
          ...product,
          ranking_top: index + 1,
        }))
      )
    }
  }, [selectedProducts.map(p => p.id).join(',')])

  const addProduct = (product) => {
    if (selectedProducts.length < 10 && !selectedProducts.find((p) => p.id === product.id)) {
      const newProduct = {
        ...product,
        ranking_top: selectedProducts.length + 1,
      }
      setSelectedProducts([...selectedProducts, newProduct])
    }
  }

  const removeProduct = (productId) => {
    setSelectedProducts(prevProducts => {
      const filtered = prevProducts.filter((p) => p.id !== productId)
      // Reajusta os rankings após remoção
      return filtered.map((product, index) => ({
        ...product,
        ranking_top: index + 1,
      }))
    })
  }

  const handleSave = async () => {
    if (!hasChanges) return
    
    setIsLoading(true)
    try {
      // Prepara os produtos selecionados com ranking atualizado
      const selectedWithRanking = selectedProducts.map((product, index) => ({
        ...product,
        ranking_top: index + 1,
      }))
      
      // Produtos não selecionados devem ter ranking_top = 0
      const unselectedProducts = availableProducts
        .filter(p => !selectedProducts.find(sp => sp.id === p.id))
        .map(product => ({
          ...product,
          ranking_top: 0,
        }))
      
      // Combina todos os produtos para enviar
      const allProducts = [...selectedWithRanking, ...unselectedProducts]
      
      const res = await fetch("/api/inicio/produto_top_10", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allProducts),
      })
      
      if (!res.ok) throw new Error("Erro ao salvar o Top 10")
      await res.json()
      
      // ✅ PONTO 4: APÓS SALVAR, ATUALIZA O ESTADO INICIAL
      setInitialProducts([...selectedProducts]);
      setHasChanges(false);
      setIsSaved(true);
      
      // Reset do estado "salvo" após 3 segundos
      setTimeout(() => {
        setIsSaved(false)
      }, 10000)

    } catch (err) {
      console.error("Erro ao salvar:", err)
      alert("Erro ao salvar o Top 10")
    } finally {
      setIsLoading(false)
    }
  }

  const isMaxReached = selectedProducts.length >= 10

  return (
    <div className="min-h-screen bg-stone-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-stone-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">⭐ Top 10 ({selectedProducts.length}/10)</h2>
          </div>
          <div className="justify-between flex mb-4">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={isMaxReached}
                  className={` w-10 h-10 rounded-full ${isMaxReached ? "bg-gray-500 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"} text-white font-bold text-xl`}
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
                            {product.imagem === "" ?
                              <div className="w-10 h-10 rounded object-cover bg-stone-600"></div>
                              :
                              <img src={product.imagem} alt={product.titulo} className="w-10 h-10 rounded object-cover"/>
                            }
                            <span className="text-white">{product.titulo}</span>
                          </div>
                          <Button onClick={() => addProduct(product)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 ml-3" disabled={isMaxReached}>
                            Adicionar +
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* ✅ PONTO 5: BOTÃO SALVAR COM LÓGICA DE HABILITAÇÃO E ESTADOS VISUAIS */}
            <Button
              onClick={handleSave}
              className={`text-white px-8 py-2 text-lg font-semibold mt-auto mb-auto transition-colors ${
                (!hasChanges || isLoading) ? "bg-gray-500 cursor-not-allowed" : 
                isSaved ? "bg-green-600 hover:bg-green-700" : 
                "bg-orange-500 hover:bg-orange-600"
              }`}
              disabled={!hasChanges || selectedProducts.length === 0 || isLoading}
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

          {selectedProducts.length === 0 ? (
            <div className="text-stone-400 text-center py-8">Nenhum produto no Top 10</div>
          ) : (
            <Reorder.Group axis="y" values={selectedProducts} onReorder={setSelectedProducts}>
              {selectedProducts.map((product, index) => (
                <Reorder.Item key={product.id} value={product}>
                  <motion.div
                    className="flex items-center justify-between p-3 bg-stone-700 rounded-lg cursor-move transition-all duration-200 hover:bg-stone-600 mb-2"
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
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-5 h-5 text-stone-400" />
                      {product.imagem === "" ?
                        <div className="w-12 h-12 rounded object-cover bg-stone-600"></div>
                        :
                        <img src={product.imagem} alt={product.titulo} className="w-12 h-12 rounded object-cover"/>
                      }
                      <span className="text-white">{product.titulo}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="ml-3 flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full text-sm font-bold text-white">
                        {index + 1}
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
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  )
}