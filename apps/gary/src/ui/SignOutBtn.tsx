'use client';
import { Btn } from './Btn';
import { signOut } from 'next-auth/react';

export function SignOutBtn() {
  return (
    <Btn
      onClick={() => signOut()}
      className="text-gary-primary hover:text-gary-primary/80 underline"
    >
      Sign Out
    </Btn>
  );
}
