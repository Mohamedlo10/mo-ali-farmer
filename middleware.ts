import { NextRequest, NextResponse } from 'next/server';

// Liste des origines autorisées
const allowedOrigins = ['*'];

// Liste des méthodes HTTP autorisées
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

export async function middleware(request: NextRequest) {
  // Gestion des requêtes OPTIONS (prévol)
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const response = new NextResponse(null, { status: 204 }); // No Content
    
    // Définir les en-têtes CORS
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Vérifier si l'origine est autorisée
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    return response;
  }

  // Pour les autres méthodes, ajouter les en-têtes CORS
  const response = NextResponse.next();
  const origin = request.headers.get('origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Gestion de l'authentification pour les routes protégées
  const protectedRoutes = ['/dashboard', '/api/protected'];
  const pathname = request.nextUrl.pathname;
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const supabase = (await import('@/lib/supabaseClient')).createClient();
    const authToken = request.cookies.get('sb-tjlasinxumybwhrjkurv-auth-token')?.value || 
                     request.cookies.get('sb-tjlasinxumybwhrjkurv-auth-token.0')?.value || 
                     request.cookies.get('sb-tjlasinxumybwhrjkurv-auth-token.1')?.value;
    
    if (!authToken) {
      console.log('Accès non autorisé : Token manquant');
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data) {
        console.error("Erreur d'authentification :", error);
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du token :", err);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*', // Toutes les routes API
    '/dashboard/:path*', // Routes du dashboard
    '/dashboard', // Page d'accueil du dashboard
  ]
};
