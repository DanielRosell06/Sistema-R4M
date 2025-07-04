"use client";

import { useState, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  pointerWithin
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Skeleton } from "../../../components/ui/skeleton";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import DraggableList from "../../../components/personalizados/listaCategorias";
import ProductManager from "../../../components/personalizados/top10";

// --- Componente para o Item do Produto (arrastável) ---
function ProductItem({ product }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 mb-2 bg-stone-700 rounded-md shadow-sm text-white flex items-center gap-3 cursor-grab active:cursor-grabbing"
    >
      {product.imagem ? (
        <img
          src={product.imagem}
          alt={product.titulo}
          className="w-10 h-10 object-cover rounded-sm flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 bg-stone-600 rounded-sm flex-shrink-0"></div>
      )}
      <span className="text-sm">{product.titulo}</span>
    </div>
  );
}

// --- Componente para a Coluna da Categoria (recebe os drops) ---
function CategoryColumn({ id, title, products, onDelete }) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id });
  const validProducts = products.filter(p => p && p.id);

  return (
    <div className="bg-stone-800 rounded-lg p-4 w-[47%] flex-shrink-0 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className={(title === "Sem Categoria" ? "text-stone-400 italic" : "text-orange-400") + " font-bold text-lg"}>{title}</h3>
        {title !== 'Sem Categoria' && (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            onClick={() => onDelete(id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z" />
            </svg>
          </Button>
        )}
      </div>
      <SortableContext id={id.toString()} items={validProducts.map(p => p.id)}>
        {/* CORREÇÃO: Adicionado overflow-y-auto para o scroll */}
        <div
          ref={setDroppableRef}
          className={`flex-grow bg-stone-900/50 p-2 rounded-md min-h-[100px] space-y-2 overflow-y-auto ${isOver ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
        >
          {validProducts.map(p => (
            <ProductItem key={p.id} product={p} />
          ))}
          {validProducts.length === 0 && (
            <div className="text-sm text-stone-500 text-center pt-10">
              Arraste produtos para esta categoria.
            </div>
          )}
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
  const [loadData, setLoadData] = useState(-1);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/inicio/organizacao'),
          fetch('/api/inicio/categoria')
        ]);
        const products = await productsRes.json();
        const categories = await categoriesRes.json();

        const newColumns = {};
        categories.forEach(cat => {
          newColumns[cat.id] = { title: cat.titulo, products: [] };
        });

        products.forEach(p => {
          if (!p || !p.id) return;
          // MELHORIA: Garante que o produto vá para 'Sem Categoria' se sua categoria não existir
          const categoryId = p.id_Categoria && newColumns[p.id_Categoria] ? p.id_Categoria : 1;
          if (newColumns[categoryId]) {
            newColumns[categoryId].products.push(p);
          }
        });

        // Ordena os produtos dentro de cada categoria pelo ranking
        Object.values(newColumns).forEach(col => {
          col.products.sort((a, b) => a.ranking_categoria - b.ranking_categoria);
        });

        const orderedColumns = {};
        if (newColumns[1]) {
          orderedColumns[1] = newColumns[1];
        }
        Object.keys(newColumns).forEach(key => {
          if (String(key) !== "1") {
            orderedColumns[key] = newColumns[key];
          }
        });

        setColumns(orderedColumns);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [loadData]);

  const findContainer = id => {
    if (id in columns) return id;
    return Object.keys(columns).find(key =>
      columns[key].products.some(p => p.id === id)
    );
  };

  function handleDragStart(event) {
    const product = Object.values(columns)
      .flatMap(col => col.products)
      .find(p => p.id === event.active.id);
    setActiveProduct(product);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveProduct(null);

    if (!over || active.id === over.id) return;

    const fromContainerId = findContainer(active.id);
    const toContainerId = findContainer(over.id) || over.id;

    if (!fromContainerId || !toContainerId) return;

    setColumns((prev) => {
      const newCols = JSON.parse(JSON.stringify(prev));
      const sourceProducts = newCols[fromContainerId].products;
      const activeProductIndex = sourceProducts.findIndex(p => p.id === active.id);

      if (activeProductIndex === -1) return prev;

      const [movedItem] = sourceProducts.splice(activeProductIndex, 1);
      const destProducts = newCols[toContainerId].products;
      let overProductIndex;

      if (over.id in newCols) {
        // Dropping on container
        overProductIndex = destProducts.length;
      } else {
        // Dropping on item
        overProductIndex = destProducts.findIndex(p => p.id === over.id);
      }

      destProducts.splice(overProductIndex >= 0 ? overProductIndex : destProducts.length, 0, movedItem);

      return newCols;
    });
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    try {
      await fetch('/api/inicio/categoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newCategoryName }),
      });
      setNewCategoryName("");
      setLoadData(Date.now()); // Força o reload dos dados
    } catch {
      alert("Erro ao criar categoria");
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Os produtos serão movidos para 'Sem Categoria'.")) return;
    try {
      await fetch(`/api/inicio/categoria/${id}`, { method: 'DELETE' });
      setLoadData(Date.now()); // Força o reload dos dados
    } catch {
      alert("Erro ao excluir categoria.");
    }
  }

  async function handleSaveChanges() {
    const toUpdate = [];
    Object.entries(columns).forEach(([colId, col]) => {
      col.products.forEach((p, i) => {
        // CORREÇÃO: Adicionado ranking_categoria para salvar a ordem
        toUpdate.push({
          id: p.id,
          id_Categoria: Number(colId),
          ranking_top: 0, // Resetar ranking_top, já que esta tela não é para isso
          ranking_categoria: i + 1, // Salva a ordem na categoria
        });
      });
    });

    try {
      const res = await fetch('/api/inicio/organizacao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productsToUpdate: toUpdate }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      alert("Organização salva com sucesso!");
    } catch {
      alert("Erro ao salvar alterações.");
    }
  }

  // O restante do componente (JSX de loading e da página) permanece o mesmo...
  // (O código foi omitido por brevidade, mas você deve mantê-lo como estava)
  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6 bg-stone-900 text-stone-300">
        {/* Cabeçalho Principal */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-64 bg-stone-700" />
            <Skeleton className="h-4 w-96 mt-2 bg-stone-700" />
          </div>
        </div>

        {/* Controles Superiores: Input e Botões */}
        <div className="flex items-end gap-2">
          <div className="flex-1 max-w-sm">
            {/* Input Falso */}
            <Skeleton className="h-10 w-full bg-stone-700" />
          </div>
          {/* Botão "Criar Categoria" */}
          <Skeleton className="h-10 w-32 bg-orange-500" />
          {/* Botão "Salvar" */}
          <Skeleton className="h-10 w-24 bg-orange-500" />
        </div>

        {/* Layout Principal: Colunas de Produtos e Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Colunas de Categorias (2/3 da tela) */}
          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            {/* Coluna de Categoria 1 */}
            <div className="rounded-xl border border-stone-700 bg-stone-800 p-4 space-y-4">
              <Skeleton className="h-6 w-1/2 bg-stone-700" />
              <div className="p-6 text-center text-sm">
                <Skeleton className="h-4 w-3/4 mx-auto bg-stone-700" />
              </div>
            </div>

            {/* Coluna de Categoria 2 (com produtos) */}
            <div className="rounded-xl border border-stone-700 bg-stone-800 p-4 space-y-4">
              <Skeleton className="h-6 w-3/4 bg-stone-700" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full bg-stone-700" />
                <Skeleton className="h-16 w-full bg-stone-700" />
                <Skeleton className="h-16 w-full bg-stone-700" />
                <Skeleton className="h-16 w-full bg-stone-700" />
              </div>
            </div>
          </div>

          {/* Sidebar (1/3 da tela) */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Box de Organizar Categorias */}
            <div className="rounded-xl border border-stone-700 bg-stone-800 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40 bg-stone-700" />
                <Skeleton className="h-8 w-32 bg-stone-700" />
              </div>
              <Skeleton className="h-4 w-full bg-stone-700" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full bg-stone-700" />
                <Skeleton className="h-12 w-full bg-stone-700" />
              </div>
            </div>

            {/* Box do Top 10 */}
            <div className="rounded-xl border border-stone-700 bg-stone-800 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-28 bg-stone-700" />
                <Skeleton className="h-8 w-8 rounded-full bg-orange-500" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-8 w-32 bg-stone-700" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-14 w-full bg-stone-700" />
                <Skeleton className="h-14 w-full bg-stone-700" />
                <Skeleton className="h-14 w-full bg-stone-700" />
                <Skeleton className="h-14 w-full bg-stone-700" />
              </div>
            </div>
          </div>
        </div>
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
      </div>

      <div className='w-[100%] flex'>
        <div className='w-[55%]'>
          <div className='flex'>
            <div className="mt-4 mb-4 p-4 bg-stone-800 rounded-lg flex gap-4 items-center w-[76%]">
              <Input
                type="text"
                placeholder="Nome da nova categoria"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="bg-stone-700 border-stone-600"
              />
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleCreateCategory}>Criar Categoria</Button>
            </div>
            <Button
              className="ml-[4%] w-[16%] mt-auto mb-auto bg-orange-500 hover:bg-orange-600"
              onClick={handleSaveChanges}>
              Salvar
            </Button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 pb-4 w-[100%] flex-wrap">
              {Object.entries(columns).map(([id, col]) => (
                <CategoryColumn key={id} id={id} title={col.title} products={col.products} onDelete={handleDeleteCategory} />
              ))}
            </div>
            <DragOverlay>{activeProduct ? <ProductItem product={activeProduct} /> : null}</DragOverlay>
          </DndContext>
        </div>
        <div className='flex flex-col w-[45%]'>
          <DraggableList />
          <ProductManager />
        </div>
      </div>
    </div>
  );
}