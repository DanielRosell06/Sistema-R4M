// components/CreateUserForm.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateUserForm() {
  const router = useRouter();

  // Form state
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("comum");
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/auth/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, username, senha, tipo }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erro ao criar usuário");
      }

      setMensagem({
        tipo: "sucesso",
        texto: `Usuário criado com sucesso! ID: ${data.user.id}`,
      });

      // limpa formulário
      setNome("");
      setUsername("");
      setSenha("");
      setTipo("comum");

      // volta para o painel admin após 2 segundos
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-900">
      <div className="max-w-md w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-stone-800 p-8 rounded-lg shadow-2xl border border-stone-700"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Criar <span className="text-orange-500">Usuário</span>
          </h2>

          {mensagem && (
            <div
              className={`mb-4 text-center p-2 rounded border ${
                mensagem.tipo === "sucesso"
                  ? "text-emerald-400 bg-emerald-900/20 border-emerald-800"
                  : "text-red-400 bg-red-900/20 border-red-800"
              }`}
            >
              {mensagem.texto}
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2 font-medium text-stone-300" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-3 bg-stone-700 text-white border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-stone-300" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-stone-700 text-white border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Escolha um username único"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-stone-300" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-3 bg-stone-700 text-white border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Digite uma senha segura"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-stone-300" htmlFor="tipo">
              Tipo de Usuário
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-3 bg-stone-700 text-white border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            >
              <option value="comum">Comum</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {carregando ? "Criando..." : "Criar Usuário"}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium"
            >
              ← Voltar ao Painel Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}