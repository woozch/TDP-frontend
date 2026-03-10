import { getServerSession } from "next-auth";
import NextAuth from "next-auth";
import type { NextAuthOptions, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createGoogleAllowlistRepository } from "@/shared/auth/google-allowlist-repository";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;
const enableDevSignIn = process.env.ENABLE_DEV_SIGNIN !== "false";

if (isProduction && !process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set in production.");
}

export const DEV_USER = {
  id: "dev-user-tdp",
  email: "dev.tdp.local@gradiantbio.com",
  name: "Development User",
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
    ...(isDevelopment && enableDevSignIn
      ? [
          Credentials({
            id: "credentials",
            name: "Development sign in",
            credentials: {
              email: { label: "Email", type: "text" },
              password: { label: "Password", type: "password" }
            },
            async authorize() {
              return DEV_USER;
            }
          })
        ]
      : [])
  ];
}

const googleAllowlistRepository = createGoogleAllowlistRepository(
  (process.env.GOOGLE_ALLOWLIST_PROVIDER as "local-file" | "firebase" | undefined) ?? "local-file"
);

function getDomainFromEmail(email: string): string | null {
  const atIndex = email.lastIndexOf("@");
  if (atIndex <= -1 || atIndex === email.length - 1) {
    return null;
  }
  return email.slice(atIndex + 1).trim().toLowerCase();
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "tdp-dev-secret-local-only",
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: "/signin"
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        return false;
      }

      const { domains, emails } = await googleAllowlistRepository.getAllowlist();
      if (domains.length === 0 && emails.length === 0) {
        return isDevelopment;
      }
      const emailDomain = getDomainFromEmail(email);

      if (emails.includes(email)) {
        return true;
      }

      if (emailDomain && domains.includes(emailDomain)) {
        return true;
      }

      return false;
    },
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

/** Development helper: fall back to dev user session when no session is found. */
export async function getOrCreateDevSession(): Promise<Session> {
  const session = await auth();
  if (session?.user) {
    return session;
  }
  if (!isDevelopment || !enableDevSignIn) {
    throw new Error("Development fallback session is disabled.");
  }
  return {
    user: {
      id: DEV_USER.id,
      email: DEV_USER.email,
      name: DEV_USER.name,
      image: DEV_USER.image
    },
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
  };
}
