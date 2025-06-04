// components/CreateUserForm.jsx

"use client";

import { useState } from "react";

export default function CreateUserForm() {
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("comum"); // valor padrão “comum”
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    try {
      const res = await fetch("/api/auth/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, username, senha, tipo }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Se a API retornou algum erro (4xx ou 5xx)
        throw new Error(data.message || "Erro ao criar usuário");
      }

      // data.user.id vem do handler de /api/auth/registrar
      setMensagem({
        tipo: "sucesso",
        texto: `Usuário criado com sucesso! ID: ${data.user.id}`,
      });

      // Limpar campos do formulário após sucesso
      setNome("");
      setUsername("");
      setSenha("");
      setTipo("comum");
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-white text-center">
        Criar <span className="text-orange-500">Usuário</span>
      </h2>

      {mensagem && (
        <div
          className={`p-3 mb-6 rounded-lg border ${
            mensagem.tipo === "sucesso"
              ? "bg-green-900/20 text-green-400 border-green-800"
              : "bg-red-900/20 text-red-400 border-red-800"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block mb-2 font-medium text-gray-300">
            Nome:
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Digite seu nome completo"
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block mb-2 font-medium text-gray-300">
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Escolha um username único"
          />
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="senha" className="block mb-2 font-medium text-gray-300">
            Senha:
          </label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Digite uma senha segura"
          />
        </div>

        {/* Tipo (Admin ou Comum) */}
        <div>
          <label htmlFor="tipo" className="block mb-2 font-medium text-gray-300">
            Tipo de Usuário:
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          >
            <option value="comum">Comum</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {carregando ? "Criando..." : "Criar Usuário"}
        </button>
      </form>
    </div>
  );
}
