'use client';
import AppHeader from '@/components/AppHeader';

const SECTIONS = [
  {
    title: 'Início Rápido',
    icon: '✦',
    items: [
      { q: 'Como fazer minha primeira avaliação?', a: 'Vá em "Avaliar", preencha o nome do exercício, escolha o tipo de trabalho, selecione o tom do feedback, informe o nome do aluno e clique em "Gerar Avaliação".' },
      { q: 'Preciso de API Key para usar?', a: 'Não por enquanto. A versão atual gera feedback de exemplo para você testar o fluxo completo. A integração com IA real será habilitada em breve.' },
      { q: 'Os dados ficam salvos?', a: 'Sim, enquanto o servidor estiver rodando. Como estamos usando armazenamento em memória, os dados são perdidos ao reiniciar o servidor. Em breve teremos banco de dados persistente.' },
    ],
  },
  {
    title: 'Perfil do Professor',
    icon: '👤',
    items: [
      { q: 'Para que serve o perfil?', a: 'O perfil armazena seu nome, disciplina, turma e tom de voz preferido. Ao selecionar um perfil na tela de avaliação, esses dados são preenchidos automaticamente.' },
      { q: 'O que é a "Amostra de escrita"?', a: 'É um trecho de feedback que você mesmo escreveria. Quando integrado com IA, o sistema vai imitar seu estilo, vocabulário e forma de se expressar.' },
      { q: 'Posso ter vários perfis?', a: 'Sim! Crie um perfil por disciplina ou turma. Ex: "Design 3D - Turma A" com tom rigoroso, e "Fotografia - Turma B" com tom encorajador.' },
    ],
  },
  {
    title: 'Exercícios & Critérios',
    icon: '📋',
    items: [
      { q: 'Para que serve salvar um exercício?', a: 'Para reutilizar o mesmo enunciado e critérios em turmas ou semestres diferentes. Configure uma vez e use sempre.' },
      { q: 'O que são os pesos dos critérios (1×, 2×, 3×)?', a: 'Um critério com peso 3× vale três vezes mais na nota final do que um com peso 1×. Use pesos maiores para os critérios mais importantes da sua disciplina.' },
      { q: 'Posso mudar os critérios na hora da avaliação?', a: 'Sim. Na tela de Avaliação, a seção "Critérios de Avaliação" permite adicionar, remover e ajustar os pesos antes de gerar o feedback.' },
    ],
  },
  {
    title: 'Tom do Feedback',
    icon: '💬',
    items: [
      { q: 'Qual a diferença entre os tons?', a: 'Neutro: direto e equilibrado. Construtivo: equilibra crítica com sugestões. Encorajador: valoriza o esforço. Rigoroso: exigente e técnico. Didático: explica o raciocínio. Informal: descontraído. Formal: parecer acadêmico.' },
      { q: 'Qual tom devo usar?', a: 'Depende do aluno e do contexto. Para alunos desmotivados, use Encorajador. Para trabalhos de conclusão, use Formal ou Rigoroso. Para aulas mais dinâmicas, Construtivo ou Didático.' },
    ],
  },
  {
    title: 'Painel da Turma',
    icon: '📊',
    items: [
      { q: 'Como filtrar as avaliações?', a: 'Use os campos de filtro: busque por nome do aluno, filtre por tipo de trabalho, ou defina uma faixa de nota (mínima e máxima).' },
      { q: 'Como exportar os dados?', a: 'Clique em "Exportar CSV" para baixar todas as avaliações filtradas em formato de planilha, compatível com Excel e Google Sheets.' },
      { q: 'O "Limpar tudo" é reversível?', a: 'Não. O botão "Limpar tudo" exclui permanentemente todas as avaliações. Use com cuidado e exporte o CSV antes, se quiser guardar os dados.' },
    ],
  },
];

export default function AjudaPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif' }}>
      <AppHeader active="/ajuda" />

      <main style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>Central de Ajuda</h1>
        <p style={{ fontSize: 12, color: '#8a8680', marginBottom: 28 }}>Perguntas frequentes e dicas para usar o AvalIA</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {SECTIONS.map(section => (
            <div key={section.title} style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #dddbd6', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{section.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1814' }}>{section.title}</span>
              </div>
              <div>
                {section.items.map((item, i) => (
                  <div key={i} style={{ padding: '16px 24px', borderBottom: i < section.items.length - 1 ? '1px solid #f0eeea' : 'none' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1814', marginBottom: 6 }}>{item.q}</div>
                    <div style={{ fontSize: 13, color: '#4a4740', lineHeight: 1.6 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
