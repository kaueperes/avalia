'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Início' },
  { href: '/avaliar', label: 'Avaliar' },
  { href: '/painel', label: 'Painel da Turma' },
  { href: '/perfis', label: 'Perfil do Professor' },
  { href: '/exercicios', label: 'Gerenciar Exercícios' },
  { href: '/ajuda', label: 'Ajuda' },
];

export default function AppHeader({ active }) {
  const router = useRouter();
  function logout() { localStorage.clear(); router.push('/login'); }

  return (
    <header style={{
      height: 64, background: '#f5f4f0', borderBottom: '1px solid #dddbd6',
      padding: '0 20px', display: 'flex', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 200, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 20, borderRight: '1px solid #dddbd6', marginRight: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1814', letterSpacing: '-0.5px' }}>
          Avali<span style={{ color: '#2a7fd4' }}>A</span>
        </span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1 }}>
        {NAV.map(n => (
          <Link key={n.href} href={n.href} style={{
            padding: '0 16px', display: 'flex', alignItems: 'center',
            fontSize: 12, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap',
            color: n.href === active ? '#2a7fd4' : '#8a8680',
            borderBottom: n.href === active ? '2px solid #2a7fd4' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {n.label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} style={{
        padding: '6px 14px', border: '1px solid #dddbd6', borderRadius: 6,
        fontSize: 12, color: '#4a4740', background: 'transparent', cursor: 'pointer', flexShrink: 0,
      }}>
        Sair
      </button>
    </header>
  );
}
