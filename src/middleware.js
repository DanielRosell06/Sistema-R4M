import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = new URL(request.url);

    // Ignorar rotas públicas
    if (pathname === "/login" || pathname.startsWith("/_next") || pathname.startsWith("/api/auth/login") || pathname === "/admin" || pathname === "/registrar" || pathname === "/produtos") { 
    //  Caso precise testar, só adicioar isso nessa condição 
    //  || pathname === "/admin" || pathname === "/registrar" || pathname === "/produtos"
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;
    const userCookie = request.cookies.get("user")?.value;
    let user = {};
    try {
        user = userCookie ? JSON.parse(userCookie) : {};
    } catch (e) {
        user = {};
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if ((pathname === "/registrar" || pathname.startsWith("/admin")) && user.tipo !== "admin") {
        return NextResponse.redirect(new URL("/produtos", request.url));
    }

    return NextResponse.next();
}