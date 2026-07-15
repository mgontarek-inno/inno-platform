import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|landing-header.png|inhub-logo-white.png|dark_logo.png|meet-icon.svg).*)",
  ],
};
