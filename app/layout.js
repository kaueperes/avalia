import './globals.css';

export const metadata = {
  title: 'Kriteria — Avaliação Inteligente para Educadores',
  description: 'Avaliação educacional com IA',
  icons: { icon: '/imagens/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
