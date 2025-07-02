// File: src/components/personalizados/botaoSair.jsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from "js-cookie";

const BotaoSair = () => {

  const [userData, setUserData] = useState(Cookies.get("user"))

  const router = useRouter();
  const handleLogout = () => {
    // Remove o cookie
    document.cookie = "token=; user=; Max-Age=0; path=/";
    // Redireciona
    router.push('/login');
  };

  return (
    <div>
      Olá {JSON.parse(userData).nome}
      <button
        type="button"
        onClick={handleLogout}
        className="ml-4 transition-all hover:text-orange-500 hover:cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
      </button>
    </div>
  );
};

export default BotaoSair; // Exportação padrão corrigida