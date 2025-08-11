import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  // Add other protected routes here
]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    // Protect the route and let Clerk handle the response
    auth().protect();
  }
  
  // For all other cases, continue with the response
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and _next internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Include API routes if needed
    "/(api|trpc)(.*)",
  ],
};