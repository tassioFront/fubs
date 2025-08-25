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
      <body>{children}</body>
    </html>
  );
}
