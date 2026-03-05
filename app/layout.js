import './globals.css';

export const metadata = {
  title: 'AvaliA',
  description: 'Avaliação educacional com IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
