"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, Reorder } from "framer-motion"
import { GripVertical, User, Save, Check } from "lucide-react"

export default function Component() {
  const [names, setNames] = useState([])

  useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await fetch("/api/inicio/categoria", { method: "GET" })
                if (!res.ok) {
                    throw new Error(`Erro HTTP: ${res.status}`)
                }
                let data = await res.json()
                data = data.filter(item => item.titulo !== "Sem Categoria")
                setNames(data)
            } catch (err) {
                console.error("Erro ao buscar categorias:", err)
                // Opcional: mostrar mensagem de erro para o usuário
            }
        }
        fetchCategorias()
    }, [])

  const [initialOrder, setInitialOrder] = useState(names.map((n) => n.id).join(","))
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const currentOrder = names.map((n) => n.id).join(",")
    setHasChanges(currentOrder !== initialOrder)
    setIsSaved(false)
  }, [names, initialOrder])

  useEffect(() => {
    setNames((prevNames) =>
      prevNames.map((person, index) => ({
        ...person,
        ranking: index + 1,
      })),
    )
  }, [names.map((n) => n.id).join(",")])

  const handleSave = () => {
    setInitialOrder(names.map((n) => n.id).join(","))
    setHasChanges(false)
    setIsSaved(true)

    // Simular salvamento (aqui você pode adicionar lógica para salvar no backend)
    console.log("Lista salva:", names)

    // Remover indicador de salvo após 2 segundos
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lista de Nomes
          </CardTitle>
          <p className="text-sm text-muted-foreground">Arraste e solte para reordenar os nomes</p>

          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-full"
              variant={isSaved ? "default" : "outline"}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Reorder.Group axis="y" values={names} onReorder={setNames} className="space-y-2">
            {names.map((person, index) => (
              <Reorder.Item key={person.id} value={person}>
                <motion.div
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border cursor-grab active:cursor-grabbing hover:bg-secondary/70 transition-colors"
                  whileDrag={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{person.titulo.charAt(0)}</span>
                    </div>
                    <span className="font-medium">{person.titulo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">#{person.ranking}</span>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Dados salvos em tempo real:</h4>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {names.map((person) => (
                <div key={person.id} className="flex justify-between">
                  <span>{person.titulo}</span>
                  <span className="text-muted-foreground">Posição: {person.ranking}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
