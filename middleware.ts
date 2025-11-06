import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/chat(.*)",
  "/patients(.*)",
  "/interview(.*)",
  "/role-select(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const currentPath = request.nextUrl.pathname;

  // 🔓 1. Allow public routes (sign-in/up, home) for non-logged users
  if (!userId && isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 🚫 2. Restrict access for unauthenticated users
  if (!userId && isProtectedRoute(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // ✅ 3. Handle logged-in users
  if (userId) {
    try {
      // Fetch user progress (whether role & interview are done)
      const response = await fetch(
        `http://localhost:5000/api/interview/get-interview-status?clerkUserId=${userId}`
      );

      if (response.ok) {
        const { roleSelected, interviewPassed } = await response.json();

        // 🧭 Case A: Role not selected → force /role-select
        if (!roleSelected && !currentPath.startsWith("/role-select")) {
          return NextResponse.redirect(new URL("/role-select", request.url));
        }

        // 🧭 Case B: Role selected but interview not passed → force /interview
        if (roleSelected && !interviewPassed && !currentPath.startsWith("/interview")) {
          return NextResponse.redirect(new URL("/interview", request.url));
        }

        // 🧭 Case C: Both done → prevent going back to role-select/interview
        if (roleSelected && interviewPassed) {
          if (
            currentPath.startsWith("/role-select") ||
            currentPath.startsWith("/interview")
          ) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }
      }
    } catch (error) {
      console.error("Error checking interview status:", error);
    }
  }

  // Default: allow navigation
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
};














// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse, type NextRequest } from "next/server";

// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/chat(.*)",
//   "/patients(.*)",
//   "/interview(.*)",
// ]);

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/role-select",
// ]);

// export default clerkMiddleware(async (auth, request) => {
//   const { userId } = await auth();
//   const currentPath = request.nextUrl.pathname;

//   if (!userId && isPublicRoute(request)) {
//     return NextResponse.next();
//   }

//   if (userId) {
//     try {
//       const response = await fetch(`http://localhost:5000/api/interview/get-interview-status?clerkUserId=${userId}`);
      
//       if (response.ok) {
//         const interviewPassed = await response.json();
        
//         if (!interviewPassed) {
//           if (currentPath.startsWith('/interview')) {
//             return NextResponse.next();
//           }
//           if (isProtectedRoute(request)) {
//             return NextResponse.redirect(new URL('/interview', request.url));
//           }
//           if (currentPath === '/') {
//             return NextResponse.next();
//           }
//         } 
//         else {
//           if (currentPath.startsWith('/interview') || currentPath === '/role-select') {
//             return NextResponse.redirect(new URL('/dashboard', request.url));
//           }
//           if (currentPath === '/') {
//             return NextResponse.next();
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error checking interview status:', error);
//     }
//   } 
//   else {
//     if (currentPath.startsWith('/interview')) {
//       return NextResponse.next();
//     }
//     if (isProtectedRoute(request)) {
//       return NextResponse.redirect(new URL('/sign-in', request.url));
//     }
//   }

//   if (isProtectedRoute(request)) {
//     auth().protect();
//   }
  
//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//     "/(api|trpc)(.*)",
//   ],
// };
