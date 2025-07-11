"use client"

import Cookies from "js-cookie";

export default function NavBarLinks() {
    // 1. Corrigir a obtenção do cookie (remover .valueOf)
    const userCookie = Cookies.get("user");
    
    let user = {};
    try {
        // 2. Verificar se o cookie existe antes de fazer parse
        if (userCookie) {
            user = JSON.parse(userCookie);
        }
    } catch (e) {
        // 3. Em caso de erro no parse, manter objeto vazio
        user = {};
    }

    return (
        <div>
            <a
                href="/produtos"
                className="mr-6 transition-colors hover:text-orange-400"
            >
                Produtos
            </a>
            <a
                href="/organizacao"
                className="mr-6 transition-colors hover:text-orange-400"
            >
                Organização
            </a>
            {user.tipo === "admin" && (
                <a
                    href="/admin"
                    className="transition-colors hover:text-orange-400"
                >
                    Administração
                </a>
            )}
        </div>
    )
}