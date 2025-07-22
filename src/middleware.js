import { NextResponse } from "next/server";

async function handleVerification(token) {
    try {
        const response = await fetch("https://sistema-r4-m.vercel.app/api/auth/verifyToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }), // Corrected: ensure body is stringified JSON
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Unknown API response error" }));
            throw new Error(errorData.message || `API verification failed with status ${response.status}`);
        }

        const data = await response.json();
        return true; // Return true/false based on API response

    } catch (error) {
        // console.error removed as per request
        return false; // Indicate verification failure
    }
}

export async function middleware(request) {
    const { pathname } = new URL(request.url);

    // Exclude public routes and the token verification API route itself
    if (
        pathname === "/login" ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth/login") ||
        pathname.startsWith("/api/public-route") ||
        pathname.startsWith("/api/auth/verifyToken") // Crucial: Prevent middleware from intercepting its own API call
    ) {
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
    } else {
        // Corrected: Await the async function handleVerification
        const isValidToken = await handleVerification(token); 
        
        if (!isValidToken) { // Check the boolean result
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    if ((pathname === "/registrar" || pathname.startsWith("/admin")) && user.tipo !== "admin") {
        return NextResponse.redirect(new URL("/produtos", request.url));
    }

    return NextResponse.next();
}