import type { DefaultSession, DefaultUser } from 'next-auth';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: string;
      email?: string | null;
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    username: string;
    role: string;
    email?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    username: string;
    role: string;
    email?: string | null;
  }
}