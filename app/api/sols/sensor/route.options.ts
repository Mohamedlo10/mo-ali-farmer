import { NextResponse } from 'next/server';

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  
  // Définir les en-têtes CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 heures
  
  return response;
}
