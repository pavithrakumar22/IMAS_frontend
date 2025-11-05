import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/chat(.*)",
  "/patients(.*)",
  "/interview(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/role-select",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const currentPath = request.nextUrl.pathname;

  if (userId && currentPath === '/role-select') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!userId && isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (userId) {
    try {
      const response = await fetch(`http://localhost:5000/api/interview/get-interview-status?clerkUserId=${userId}`);
      
      if (response.ok) {
        const interviewPassed = await response.json();
        
        if (!interviewPassed) {
          if (currentPath.startsWith('/interview')) {
            return NextResponse.next();
          }
          if (isProtectedRoute(request)) {
            return NextResponse.redirect(new URL('/interview', request.url));
          }
          if (currentPath === '/') {
            return NextResponse.next();
          }
        } 
        else {
          if (currentPath.startsWith('/interview') || currentPath === '/role-select') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
          if (currentPath === '/') {
            return NextResponse.next();
          }
        }
      }
    } catch (error) {
      console.error('Error checking interview status:', error);
    }
  } 
  else {
    if (currentPath.startsWith('/interview')) {
      return NextResponse.next();
    }
    if (isProtectedRoute(request)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  if (isProtectedRoute(request)) {
    auth().protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
};