import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  // autenticação
  const auth = request.headers.get("authorization") || "";
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) {
    return new Response("Não autorizado.", { status: 401 });
  }
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return new Response("Token inválido.", { status: 401 });
  }
  if (payload.tipo !== "admin") {
    return new Response("Acesso negado.", { status: 403 });
  }

  // lista todos
  const users = await prisma.usuario.findMany({
    select: { id: true, nome: true, username: true, tipo: true, status: true },
  });
  return new Response(JSON.stringify(users), {
    headers: { "Content-Type": "application/json" },
  });
}
