import './global.css';

export const metadata = {
  title: 'Welcome to Fubs',
  description: 'Project management for fast-moving teams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-[calc(100vh-0px)] bg-background text-foreground">
          {children}
        </main>
      </body>
    </html>
  );
}
