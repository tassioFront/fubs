import Link from 'next/link';

export default function FubsLogo() {
  return (
    <h1 className="text-display-xl sm:text-display-2xl font-extrabold tracking-tight">
      <Link href="/">
        <span className="bg-gradient-to-r from-gary-primary to-gary-secondary bg-clip-text text-transparent">
          Fubs
        </span>
      </Link>
    </h1>
  );
}
