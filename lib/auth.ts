import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: false,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubUsername: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && typeof (profile as { login?: unknown }).login === "string") {
        token.githubUsername = (
          profile as { login: string }
        ).login.toLowerCase();
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.githubUsername =
          typeof (token as { githubUsername?: unknown }).githubUsername ===
            "string"
            ? ((token as { githubUsername: string }).githubUsername as string)
            : null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

