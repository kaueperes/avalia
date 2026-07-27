import './globals.css';

export const metadata = {
  title: 'Kriteria — Avaliação Inteligente para Educadores',
  description: 'O Kriteria corrige trabalhos de alunos com os critérios e o estilo do professor — mais rápido, com qualidade e consistência.',
  icons: { icon: '/imagens/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
