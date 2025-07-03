// File: src/app/(inicio)/organizacao/page.js

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
  arrayMove,
  verticalListSortingStrategy
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
        <h3 className={(title == "Sem Categoria" ? "text-stone-400 italic" : "text-orange-400") + " font-bold text-lg "}>{title}</h3>
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
      <SortableContext id={id.toString()} items={validProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setDroppableRef}
          className={`flex-grow bg-stone-900/50 p-2 rounded-md min-h-[100px] space-y-2 ${isOver ? 'ring-2 ring-offset-2 ring-orange-500' : ''
            }`}
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

        // Inicializa apenas com as categorias do banco
        const newColumns = {};
        categories.forEach(cat => {
          newColumns[cat.id] = { title: cat.titulo, products: [] };
        });

        products.forEach(p => {
          if (!p || !p.id) return;
          if (p.id_Categoria && newColumns[p.id_Categoria]) {
            newColumns[p.id_Categoria].products.push(p);
          }
        });

        // Ordena as colunas para que a de ID 1 fique em primeiro
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
    if (!over) return;

    const from = findContainer(active.id);
    const to = findContainer(over.id) || over.id;
    if (!from || !to) return;

    setColumns(prev => {
      const cols = { ...prev };
      const source = [...cols[from].products];
      const dest = from === to ? source : [...cols[to].products];

      const idxFrom = source.findIndex(p => p.id === active.id);
      const idxTo = dest.findIndex(p => p.id === over.id);
      const toIndex = idxTo < 0 ? dest.length : idxTo;
      if (idxFrom < 0) return prev;

      const [moved] = source.splice(idxFrom, 1);
      dest.splice(toIndex, 0, moved);

      cols[from].products = from === to ? dest : source;
      cols[to].products = dest;
      return cols;
    });
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/inicio/categoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newCategoryName }),
      });
      setLoadData(loadData * -1)
      setNewCategoryName("");
    } catch {
      alert("Erro ao criar categoria");
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      const res = await fetch(`/api/inicio/categoria/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setColumns(prev => {
        const cols = { ...prev };
        cols['sem-categoria'].products.push(...cols[id].products);
        delete cols[id];
        return cols;
      });
    } catch {
      alert("Erro ao excluir categoria.");
    }
  }

  async function handleSaveChanges() {
    const toUpdate = [];
    Object.entries(columns).forEach(([colId, col]) => {
      col.products.forEach((p, i) => {
        toUpdate.push({
          id: p.id,
          id_Categoria: ['sem-categoria', 'top-10'].includes(colId) ? null : Number(colId),
          ranking_top: colId === 'top-10' ? i + 1 : 0,
        });
      });
    });
    try {
      const res = await fetch('/api/inicio/organizacao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productsToUpdate: toUpdate }),
      });
      if (!res.ok) throw new Error();
      alert("Organização salva com sucesso!");
    } catch {
      alert("Erro ao salvar alterações.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 text-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-9 w-72 mb-2 bg-stone-700" />
            <Skeleton className="h-5 w-96 bg-stone-700" />
          </div>
          <Skeleton className="h-10 w-36 bg-orange-500/50" />
        </div>

        <div className="mb-8 p-4 bg-stone-800 rounded-lg flex gap-4 items-center">
          <Skeleton className="h-10 flex-grow bg-stone-700" />
          <Skeleton className="h-10 w-36 bg-stone-700" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-stone-800 rounded-lg p-4 w-full md:w-80 flex-shrink-0 flex flex-col min-h-[400px]">
              <Skeleton className="h-7 w-32 mb-4 bg-orange-400/50" />
              <div className="space-y-3">
                <Skeleton className="h-14 w-full bg-stone-700" />
                <Skeleton className="h-14 w-full bg-stone-700" />
                <Skeleton className="h-14 w-full bg-stone-700" />
              </div>
            </div>
          ))}
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
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { handleCreateCategory() }}>Criar Categoria</Button>
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
          <ProductManager></ProductManager>
        </div>
      </div>
    </div>
  );
}
