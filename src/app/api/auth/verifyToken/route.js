import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
    return NextResponse.json(
        { message: "Rota de verificação aberta" }, // Opcional: retornar o payload
        { status: 200 } // Status 200 OK
    );
}
export async function POST(request, { params }) {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json(
            { message: "Token não fornecido." },
            { status: 401 } // Status 401 Unauthorized
        );
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return NextResponse.json(
            { message: "Token validado e válido.", payload }, // Opcional: retornar o payload
            { status: 200 } // Status 200 OK
        );

    } catch (error) {
        // 5. Capturar e tratar erros de validação do token
        console.error("Erro na validação do token:", error.message);

        // Tipos comuns de erros de JWT:
        if (error.name === 'TokenExpiredError') {
            return NextResponse.json(
                { message: "Token expirado. Faça login novamente." },
                { status: 401 }
            );
        } else if (error.name === 'JsonWebTokenError') {
            // Inclui 'invalid signature', 'jwt malformed', etc.
            return NextResponse.json(
                { message: "Token inválido. Acesso negado." },
                { status: 401 }
            );
        } else {
            // Outros erros inesperados
            return NextResponse.json(
                { message: "Erro interno do servidor." },
                { status: 500 }
            );
        }
    }
}