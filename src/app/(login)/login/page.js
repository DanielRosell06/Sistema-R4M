"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    async function handlesubmit(e) {
        e.preventDefault();
        setError("");


        //chama a api 
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, senha }),
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.message || "Erro ao efetuar login");
            return;
        }

        Cookies.set("token", data.token, { expires: 1, path: "/" });
        Cookies.set("user", JSON.stringify(data.user), { expires: 1, path: "/" });

        // redireciona conforme nivel de acesso
    if (data.user.tipo === "admin") {
      router.push("/admin");
    } else {
      router.push("/produtos");
    }
  }
     return (
    <div className="flex items-center justify-center min-h-screen bg-stone-900">
      <form
        onSubmit={handlesubmit}
        className="bg-stone-800 p-8 max-w-sm w-full rounded-lg shadow-2xl border border-stone-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Faça o <span className="text-orange-500">Login</span>
        </h2>

        {error && (
          <p className="text-red-400 mb-4 text-center bg-red-900/20 p-2 rounded border border-red-800">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-medium text-stone-300" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-stone-700 text-white border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Digite seu username"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-stone-300" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 bg-stone-700 text-white border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Digite sua senha"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}






