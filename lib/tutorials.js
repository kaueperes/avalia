// Vídeos tutoriais do canal do YouTube do Kriteria.
// Pra trocar um vídeo, só editar a entrada correspondente aqui — nenhuma página precisa mudar.
export const TUTORIALS = {
  inicio:            { videoId: 'P6s56o1Kd8c', title: 'Como Funciona a Plataforma de Correção com IA',              duration: '2:40' },
  'avaliar-basica':  { videoId: 'ynDFhA3fCjI', title: 'Como Corrigir Prova Rápido com Inteligência Artificial',      duration: '2:02' },
  'avaliar-avancado':{ videoId: 'fLEbSVkNsSU', title: 'Como Corrigir Redação e Trabalho de Aluno com IA',            duration: '2:54' },
  'gerador-provas':  { videoId: 'hMQ8mfK8G_s', title: 'Como Criar uma Prova com Inteligência Artificial em Minutos', duration: '1:30' },
  perfis:            { videoId: 'fgchBwRXYe4', title: 'Como Personalizar o Feedback da IA',                         duration: '1:20' },
  instituicao:       { videoId: 'InS1JNcNWfE', title: 'Como Cadastrar sua Escola ou Faculdade',                     duration: '1:06' },
  disciplinas:       { videoId: 'EWc0zadEHpQ', title: 'Como Criar Critérios de Correção de Redação e Prova com IA', duration: '2:35' },
  turmas:            { videoId: 'viNvNkuT5Uw', title: 'Como Cadastrar Turma e Lista de Alunos',                     duration: '1:18' },
  avaliacoes:        { videoId: 'ZCPCb4KR72g', title: 'Como Ver o Histórico de Correções com IA e Exportar Notas',  duration: '2:03' },
  relatorios:        { videoId: 'xFZTAPcL2zc', title: 'Relatório de Desempenho da Turma com IA',                    duration: '1:46' },
};

// Ordem de exibição na galeria da central de ajuda (ordem de primeiro uso: início → avaliar → cadastros → histórico).
export const TUTORIALS_ORDER = [
  'inicio', 'avaliar-basica', 'avaliar-avancado', 'gerador-provas', 'perfis',
  'instituicao', 'disciplinas', 'turmas', 'avaliacoes', 'relatorios',
];
