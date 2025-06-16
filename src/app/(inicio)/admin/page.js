"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [modalData, setModalData] = useState({ tipo: "", status: "" });

  // checa auth e role no client
  useEffect(() => {
    const token = Cookies.get("token");
    // fetch lista
    fetch("/api/auth/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, [router]);

  async function handleDelete(id) {
    if (!confirm("Confirma exclusão deste usuário?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/auth/usuarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers((u) => u.filter((x) => x.id !== id));
  }

  function openEditModal(u) {
    setEditingUser(u);
    setModalData({ tipo: u.tipo, status: u.status });
  }

  function closeEditModal() {
    setEditingUser(null);
    setModalData({ tipo: "", status: "" });
  }

  async function handleEdit() {
    if (!editingUser || !modalData.tipo || !modalData.status) return;
    
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/auth/usuarios/${editingUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tipo: modalData.tipo, status: modalData.status }),
    });
    const updated = await res.json();
    setUsers((us) => us.map((x) => (x.id === updated.id ? updated : x)));
    closeEditModal();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold mb-6 text-white text-center">
            Painel de <span className="text-orange-500">Usuários</span>
          </h1>
          
          <div className="mb-6 text-center">
            <button
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => router.push("/registrar")}
            >
              Registrar Novo Usuário
            </button>
          </div>

          {/* Visualização Desktop - Tabela */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-600">
                  {["ID", "Nome", "Username", "Tipo", "Status", "Ações"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-300 border-b border-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr 
                    key={u.id} 
                    className={`${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'} hover:bg-gray-600 transition-colors duration-200`}
                  >
                    <td className="px-4 py-3 text-gray-300 border-b border-gray-600">{u.id}</td>
                    <td className="px-4 py-3 text-white border-b border-gray-600">{u.nome}</td>
                    <td className="px-4 py-3 text-gray-300 border-b border-gray-600">{u.username}</td>
                    <td className="px-4 py-3 border-b border-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.tipo === 'admin' 
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {u.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.status === 'ativo' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-600">
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 shadow hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => openEditModal(u)}
                        >
                          Editar
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 shadow hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => handleDelete(u.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visualização Mobile - Cards */}
          <div className="md:hidden space-y-4">
            {users.map((u) => (
              <div key={u.id} className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{u.nome}</h3>
                    <p className="text-gray-300 text-sm">@{u.username}</p>
                    <p className="text-gray-400 text-xs mt-1">ID: {u.id}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.tipo === 'admin' 
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {u.tipo}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.status === 'ativo' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 shadow hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => openEditModal(u)}
                  >
                    Editar
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 shadow hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleDelete(u.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 max-w-md w-full rounded-lg shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              Editar <span className="text-orange-500">Usuário</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2">
                  <strong>Nome:</strong> {editingUser.nome}
                </p>
                <p className="text-gray-300 mb-4">
                  <strong>Username:</strong> {editingUser.username}
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-300" htmlFor="modal-tipo">
                  Tipo de Usuário
                </label>
                <select
                  id="modal-tipo"
                  value={modalData.tipo}
                  onChange={(e) => setModalData({ ...modalData, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="comum">Comum</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-300" htmlFor="modal-status">
                  Status
                </label>
                <select
                  id="modal-status"
                  value={modalData.status}
                  onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}