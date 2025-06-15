// src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { username, senha } = await request.json();

    // 1) Validação de input
    if (!username || !senha) {
      return new Response(
        JSON.stringify({ message: "Username e senha são obrigatórios." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2) Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { username },
    });

    // 3) Usuário não encontrado
    if (!usuario) {
      return new Response(
        JSON.stringify({ message: "Usuário não encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4) Usuário inativo
    if (usuario.status !== "ativo") {
      return new Response(
        JSON.stringify({ message: "Usuário inativo. Procure um administrador." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5) Comparar senhas
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return new Response(
        JSON.stringify({ message: "Senha inválida." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6) Gerar JWT
    if (!JWT_SECRET) throw new Error("JWT_SECRET não definido no ambiente.");
    const token = jwt.sign(
      { userId: usuario.id, username: usuario.username, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7) Retirar senha do objeto antes de enviar
    const { senha: _, ...usuarioSemSenha } = usuario;

    return new Response(
      JSON.stringify({ user: usuarioSemSenha, token }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erro em /api/auth/login:", err);
    return new Response(
      JSON.stringify({ message: "Erro interno do servidor." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
