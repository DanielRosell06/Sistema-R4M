// File: src/app/(inicio)/organizacao/page.js

"use client";

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Skeleton } from "../../../components/ui/skeleton";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

// --- Componente para o Item do Produto (arrastável) ---
function ProductItem({ product }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="p-2 mb-2 bg-stone-700 rounded-md shadow-sm text-white flex items-center gap-3 cursor-grab active:cursor-grabbing">
      {product.imagem ? (
        <img src={product.imagem} alt={product.titulo} className="w-10 h-10 object-cover rounded-sm flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 bg-stone-600 rounded-sm flex-shrink-0"></div>
      )}
      <span className="text-sm">{product.titulo}</span>
    </div>
  );
}

// --- Componente para a Coluna da Categoria (recebe os drops) ---
function CategoryColumn({ id, title, products, onDelete }) {
  const { setNodeRef } = useSortable({id: id.toString(), data: {type: 'container'}});

  return (
    <div className="bg-stone-800 rounded-lg p-4 w-full md:w-80 flex-shrink-0 flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-orange-400">{title}</h3>
        {id !== 'top-10' && id !== 'sem-categoria' && (
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => onDelete(id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </Button>
        )}
      </div>
      <SortableContext id={id.toString()} items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-grow bg-stone-900/50 p-2 rounded-md min-h-[100px] space-y-2">
          {products.map(p => <ProductItem key={p.id} product={p} />)}
          {products.length === 0 && <div className="text-sm text-stone-500 text-center pt-10">Arraste produtos para esta categoria.</div>}
        </div>
      </SortableContext>
    </div>
  );
}

// --- Página Principal de Organização ---
export default function OrganizacaoPage() {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/inicio/organizacao'),
          fetch('/api/inicio/categoria')
        ]);
        const products = await productsRes.json();
        const categories = await categoriesRes.json();

        const newColumns = {
          'top-10': { title: '⭐ Top 10', products: [] },
          'sem-categoria': { title: 'Sem Categoria', products: [] },
        };
        categories.forEach(cat => {
          newColumns[cat.id] = { title: cat.titulo, products: [] };
        });

        products.forEach(p => {
            if (p.ranking_top > 0) {
                newColumns['top-10'].products.push(p);
            } else if (p.id_Categoria && newColumns[p.id_Categoria]) {
                newColumns[p.id_Categoria].products.push(p);
            } else {
                newColumns['sem-categoria'].products.push(p);
            }
        });

        newColumns['top-10'].products.sort((a, b) => a.ranking_top - b.ranking_top);
        setColumns(newColumns);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const findContainer = (id) => {
    if (id in columns) return id;
    return Object.keys(columns).find(key => columns[key].products.some(p => p.id === id));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const product = Object.values(columns)
      .flatMap(col => col.products)
      .find(p => p.id === active.id);
    setActiveProduct(product);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveProduct(null);

    if (!over) return;

    const activeContainerId = findContainer(active.id);
    const overContainerId = findContainer(over.id);

    if (!activeContainerId || !overContainerId) return;

    // Se moveu para uma nova coluna
    if (activeContainerId !== overContainerId) {
      setColumns(prev => {
        const activeItems = [...prev[activeContainerId].products];
        const overItems = [...prev[overContainerId].products];
        
        const activeIndex = activeItems.findIndex(p => p.id === active.id);
        const [movedItem] = activeItems.splice(activeIndex, 1);
        
        const overIndex = over.data.current?.sortable?.index ?? overItems.length;
        
        return {
          ...prev,
          [activeContainerId]: {
            ...prev[activeContainerId],
            products: activeItems,
          },
          [overContainerId]: {
            ...prev[overContainerId],
            products: [
              ...overItems.slice(0, overIndex),
              movedItem,
              ...overItems.slice(overIndex),
            ],
          },
        };
      });
    } else { // Se reordenou na mesma coluna
      setColumns(prev => {
        const currentItems = prev[activeContainerId].products;
        const oldIndex = currentItems.findIndex(p => p.id === active.id);
        const newIndex = currentItems.findIndex(p => p.id === over.id);

        if (oldIndex !== newIndex) {
          return {
            ...prev,
            [activeContainerId]: {
              ...prev[activeContainerId],
              products: arrayMove(currentItems, oldIndex, newIndex),
            }
          };
        }
        return prev;
      });
    }
  };

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/inicio/categoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newCategoryName }),
      });
      const newCategory = await res.json();
      setColumns(prev => ({
        ...prev,
        [newCategory.id]: { title: newCategory.titulo, products: [] }
      }));
      setNewCategoryName("");
    } catch (error) {
      alert("Erro ao criar categoria");
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
        const res = await fetch(`/api/inicio/categoria/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message);
        }
        setColumns(prev => {
            const newColumns = { ...prev };
            const productsToMove = newColumns[id].products;
            newColumns['sem-categoria'].products.push(...productsToMove);
            delete newColumns[id];
            return newColumns;
        });
    } catch(error) {
        alert(error.message || "Erro ao excluir categoria.");
    }
  }
  
  async function handleSaveChanges() {
    const productsToUpdate = [];
    Object.keys(columns).forEach(columnId => {
      columns[columnId].products.forEach((product, index) => {
        const newCategoryId = (columnId === 'sem-categoria' || columnId === 'top-10') ? null : Number(columnId);
        const newRankTop = columnId === 'top-10' ? index + 1 : 0;
        const newRankCategory = (columnId !== 'sem-categoria' && columnId !== 'top-10') ? index + 1 : 0;
        
        productsToUpdate.push({ 
          id: product.id, 
          id_Categoria: newCategoryId, 
          ranking_top: newRankTop,
          ranking_categoria: newRankCategory,
        });
      });
    });

    try {
      const res = await fetch('/api/inicio/organizacao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productsToUpdate }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      alert("Organização salva com sucesso!");
    } catch (error) {
      alert("Erro ao salvar as alterações.");
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-stone-900 p-8">
            <h1 className="text-3xl font-bold text-white">Carregando Organização...</h1>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl mb-1 font-bold text-white">Organização de Produtos</h1>
            <p className="text-gray-400">Arraste os produtos entre as colunas para organizá-los.</p>
        </div>
        <Button onClick={handleSaveChanges} className="bg-orange-500 hover:bg-orange-600">Salvar Alterações</Button>
      </div>

      <div className="mb-8 p-4 bg-stone-800 rounded-lg flex gap-4 items-center">
        <Input 
            type="text" 
            placeholder="Nome da nova categoria" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="bg-stone-700 border-stone-600"
        />
        <Button onClick={handleCreateCategory}>Criar Categoria</Button>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([id, column]) => (
            <CategoryColumn key={id} id={id} title={column.title} products={column.products} onDelete={handleDeleteCategory} />
          ))}
        </div>
        <DragOverlay>
            {activeProduct ? <ProductItem product={activeProduct} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
