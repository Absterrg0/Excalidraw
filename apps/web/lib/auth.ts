// src/auth.ts

import GitHub from "next-auth/providers/github";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma  from "@repo/db";
import { PrismaAdapter } from "@auth/prisma-adapter"

export const {handlers,auth,signIn,signOut} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    error: '/auth/error', // Error page
  },
});

