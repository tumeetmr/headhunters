import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
};

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error("Missing API_URL or NEXT_PUBLIC_API_URL");
        }

        const response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as LoginResponse;

        if (!data?.accessToken || !data?.user?.id || !data?.user?.email || !data?.user?.role) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          accessToken: data.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role as string;
        token.accessToken = user.accessToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.role = token.role as string;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};
