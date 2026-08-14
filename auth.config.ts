import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const protectedRoutes = ['/dashboard', '/collections', '/tags', '/settings'];
      const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to /login
      }

      const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
      if (isAuthRoute && isLoggedIn) {
        // Allow deliberate visits to auth pages (e.g. to switch accounts) via ?switch=true
        if (nextUrl.searchParams.has('switch')) {
          return true;
        }
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
