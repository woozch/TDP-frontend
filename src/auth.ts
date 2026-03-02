import { getServerSession } from "next-auth";
import NextAuth from "next-auth";
import type { NextAuthOptions, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const MOCK_USER = {
  id: "mock-user-tdp",
  email: "mock@tdp.local",
  name: "Mock Researcher",
  image: null as string | null
};

function buildProviders() {
  return [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Mock sign in",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize() {
        return MOCK_USER;
      }
    })
  ];
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "tdp-dev-secret-change-in-production",
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: "/signin"
  },
  providers: buildProviders(),
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id ?? token.sub;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = user.image ?? token.picture;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.image = typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    }
  }
} satisfies NextAuthOptions;

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;

/** Server-side session helper for NextAuth v4 (use in Server Components and Route Handlers). */
export async function auth() {
  return getServerSession(authOptions);
}

/** Development helper: fall back to mock user session when no session is found. */
export async function getOrCreateMockSession(): Promise<Session> {
  const session = await auth();
  if (session?.user) {
    return session;
  }
  return {
    user: {
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      image: MOCK_USER.image
    },
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
  };
}
