import jwt from "jsonwebtoken";
import { prisma } from "../../../../../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(request, { params }) {
  const auth = request.headers.get("authorization") || "";
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) return new Response("Não autorizado.", { status: 401 });
  let payload;
  try { payload = jwt.verify(token, JWT_SECRET); }
  catch { return new Response("Token inválido.", { status: 401 }); }
  if (payload.tipo !== "admin") return new Response("Acesso negado.", { status: 403 });

  const { tipo, status } = await request.json();
  const id = Number(params.id);
  const updated = await prisma.usuario.update({
    where: { id },
    data: { tipo, status },
    select: { id: true, nome: true, username: true, tipo: true, status: true },
  });
  return new Response(JSON.stringify(updated), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request, { params }) {
  const auth = request.headers.get("authorization") || "";
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) return new Response("Não autorizado.", { status: 401 });
  let payload;
  try { payload = jwt.verify(token, JWT_SECRET); }
  catch { return new Response("Token inválido.", { status: 401 }); }
  if (payload.tipo !== "admin") return new Response("Acesso negado.", { status: 403 });

  const id = Number(params.id);
  await prisma.usuario.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
