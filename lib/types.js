export const CATEGORIES = {
  '3d':     { label: '3D', icon: '⬡' },
  visual:   { label: 'Visual', icon: '◼' },
  texto:    { label: 'Texto', icon: '📝' },
  codigo:   { label: 'Código', icon: '💻' },
  outros:   { label: 'Outros', icon: '📐' },
};

export const TYPES = {
  // 3D
  modelagem:      { label:'Modelagem 3D',         icon:'⬡', cat:'3d',     input:'obj',
    hint: 'Envie o arquivo .obj e/ou imagens do trabalho — combinando os dois a avaliação fica mais completa.',
    criteria:[{name:'Topologia / Edge Flow',w:3},{name:'Proporção e Forma',w:3},{name:'Limpeza (N-gons)',w:2},{name:'Complexidade Técnica',w:1},{name:'Organização',w:1}] },
  animacao:       { label:'Animação 3D',           icon:'▶', cat:'3d',     input:'video',
    hint: 'Envie o vídeo da animação (MP4, MOV) e/ou frames-chave como imagem. A IA analisa timing, arcos e fluidez do movimento.',
    criteria:[{name:'Timing e Spacing',w:3},{name:'Arcos de Movimento',w:3},{name:'Squash & Stretch',w:2},{name:'Antecipação',w:2},{name:'Follow-through',w:2}] },
  render:         { label:'Render',                icon:'🖼', cat:'3d',     input:'img',
    hint: 'Envie a imagem do render final. Pode incluir múltiplos renders ou variações para uma avaliação mais completa.',
    criteria:[{name:'Qualidade Visual Geral',w:3},{name:'Materiais e Texturas',w:3},{name:'Iluminação',w:2},{name:'Composição',w:2},{name:'Pós-processamento',w:1}] },
  iluminacao:     { label:'Iluminação 3D',         icon:'☀', cat:'3d',     input:'img',
    hint: 'Envie o render com a iluminação aplicada. Pode incluir versões diferentes para comparação de setup de luz.',
    criteria:[{name:'Qualidade das Sombras',w:3},{name:'Contraste e Exposição',w:3},{name:'Temperatura de Cor',w:2},{name:'Luz de Preenchimento',w:2},{name:'Realismo',w:2}] },
  rigging:        { label:'Rigging',               icon:'🦴', cat:'3d',     input:'img',
    hint: 'Envie screenshots do rig em diferentes poses para demonstrar deformações, pesos e controladores.',
    criteria:[{name:'Estrutura dos Ossos',w:3},{name:'Pesos de Deformação',w:3},{name:'Controladores',w:2},{name:'Hierarquia',w:2},{name:'Nomeação',w:1}] },
  texturizacao:   { label:'Texturização',          icon:'🎨', cat:'3d',     input:'img',
    hint: 'Envie renders com os materiais aplicados. Pode incluir o mapa UV ou texturas separadas para análise completa.',
    criteria:[{name:'Qualidade do Unwrap',w:3},{name:'Resolução e Detalhes',w:3},{name:'Coerência Visual',w:2},{name:'Materiais PBR',w:2},{name:'Seamless (costuras)',w:2}] },

  // Visual
  design_grafico: { label:'Design Gráfico',        icon:'◼', cat:'visual',  input:'img',
    hint: 'Envie a peça gráfica finalizada (PNG, JPG). Pode incluir variações, versões ou detalhes relevantes.',
    criteria:[{name:'Composição e Hierarquia',w:3},{name:'Tipografia',w:3},{name:'Paleta de Cores',w:2},{name:'Conceito e Ideia',w:2},{name:'Acabamento Técnico',w:2}] },
  fotografia:     { label:'Fotografia',            icon:'📷', cat:'visual',  input:'img',
    hint: 'Envie a fotografia em boa resolução. Pode incluir série fotográfica ou fotos alternativas para contextualizar.',
    criteria:[{name:'Exposição e Luminosidade',w:3},{name:'Composição e Enquadramento',w:3},{name:'Foco e Nitidez',w:2},{name:'Narrativa Visual',w:2},{name:'Pós-processamento',w:1}] },
  ilustracao:     { label:'Ilustração Digital',    icon:'✏', cat:'visual',  input:'img',
    hint: 'Envie a ilustração finalizada. Pode incluir estudos, rascunhos ou etapas do processo.',
    criteria:[{name:'Técnica de Desenho',w:3},{name:'Uso de Cor',w:3},{name:'Proporção e Anatomia',w:2},{name:'Estilo e Expressividade',w:2},{name:'Acabamento',w:2}] },
  storyboard:     { label:'Storyboard',            icon:'🎬', cat:'visual',  input:'img',
    hint: 'Envie as pranchas do storyboard como imagem (digitalizado ou digital). Pode ser uma ou múltiplas páginas.',
    criteria:[{name:'Sequência Narrativa',w:3},{name:'Clareza dos Planos',w:3},{name:'Linguagem Cinematográfica',w:2},{name:'Expressão dos Personagens',w:2},{name:'Indicações Técnicas',w:1}] },
  ux_ui:          { label:'UX/UI Design',          icon:'⬜', cat:'visual',  input:'img',
    hint: 'Envie prints das telas ou protótipo. Pode incluir múltiplas telas para mostrar o fluxo da interface.',
    criteria:[{name:'Usabilidade e Clareza',w:3},{name:'Consistência Visual',w:3},{name:'Hierarquia da Informação',w:2},{name:'Acessibilidade',w:2},{name:'Componentes e Grid',w:2}] },
  moda:           { label:'Design de Moda',        icon:'👗', cat:'visual',  input:'img',
    hint: 'Envie o croqui ou ficha técnica digitalizada. Pode incluir detalhes de tecido, estampas e acabamentos.',
    criteria:[{name:'Conceito e Identidade',w:3},{name:'Ficha Técnica',w:3},{name:'Proporções e Silhueta',w:2},{name:'Escolha de Materiais',w:2},{name:'Apresentação Visual',w:1}] },

  // Texto
  redacao:        { label:'Redação / Artigo',      icon:'📝', cat:'texto',   input:'text',
    hint: 'Cole o texto diretamente no campo abaixo. Pode incluir imagens de apoio se o trabalho tiver elementos visuais.',
    criteria:[{name:'Argumentação e Coerência',w:3},{name:'Estrutura do Texto',w:3},{name:'Gramática e Ortografia',w:2},{name:'Repertório e Referências',w:2},{name:'Conclusão',w:2}] },
  roteiro:        { label:'Roteiro',               icon:'🎭', cat:'texto',   input:'text',
    hint: 'Cole o roteiro formatado no campo abaixo. Mantenha a formatação padrão de roteiro para uma análise mais precisa.',
    criteria:[{name:'Estrutura Dramática',w:3},{name:'Qualidade dos Diálogos',w:3},{name:'Desenvolvimento de Personagens',w:2},{name:'Formatação Técnica',w:2},{name:'Originalidade',w:2}] },
  game_design:    { label:'Game Design Doc',       icon:'🎮', cat:'texto',   input:'text',
    hint: 'Cole o documento de game design. Pode incluir imagens de conceito, diagramas ou fluxos de gameplay.',
    criteria:[{name:'Clareza e Completude',w:3},{name:'Viabilidade do Conceito',w:3},{name:'Mecânicas de Jogo',w:3},{name:'Experiência do Jogador',w:2},{name:'Originalidade',w:2}] },
  tcc:            { label:'TCC / Monografia',      icon:'📚', cat:'texto',   input:'text',
    hint: 'Cole o texto completo ou o trecho relevante para avaliação (resumo, capítulo, introdução, etc.).',
    criteria:[{name:'Problema e Hipótese',w:3},{name:'Revisão Bibliográfica',w:3},{name:'Metodologia',w:2},{name:'Análise de Resultados',w:2},{name:'Normas ABNT',w:2}] },
  musica_partitura:{ label:'Partitura',            icon:'🎵', cat:'texto',   input:'img',
    hint: 'Envie a partitura digitalizada ou exportada como imagem. Pode incluir múltiplas páginas.',
    criteria:[{name:'Harmonia e Progressão',w:3},{name:'Melodia',w:3},{name:'Ritmo e Métrica',w:2},{name:'Estrutura da Composição',w:2},{name:'Notação Musical',w:2}] },

  // Código
  programacao:    { label:'Programação',           icon:'💻', cat:'codigo',  input:'text',
    hint: 'Cole o código-fonte diretamente. Pode incluir imagens do output ou prints do programa em execução.',
    criteria:[{name:'Lógica e Algoritmo',w:3},{name:'Boas Práticas',w:3},{name:'Legibilidade',w:2},{name:'Eficiência',w:2},{name:'Documentação',w:1}] },
  web:            { label:'HTML/CSS/JS',           icon:'🌐', cat:'codigo',  input:'text',
    hint: 'Cole o código HTML, CSS e/ou JavaScript. Pode incluir prints do resultado visual no navegador.',
    criteria:[{name:'HTML Semântico',w:3},{name:'CSS e Layout',w:3},{name:'JavaScript / Interatividade',w:2},{name:'Responsividade',w:2},{name:'Boas Práticas Web',w:2}] },
  shader:         { label:'Shader',                icon:'✦', cat:'codigo',  input:'text',
    hint: 'Cole o código do shader (GLSL, HLSL ou similar). Pode incluir imagem do efeito visual gerado.',
    criteria:[{name:'Efeito Visual Alcançado',w:3},{name:'Lógica do Shader',w:3},{name:'Eficiência (performance)',w:2},{name:'Originalidade',w:2},{name:'Documentação',w:1}] },

  // Outros
  arquitetura_img:{ label:'Prancha Arquitetônica', icon:'🏗', cat:'outros',  input:'img',
    hint: 'Envie a prancha como imagem. Pode incluir múltiplas pranchas (plantas, cortes, fachadas, perspectivas).',
    criteria:[{name:'Clareza da Representação',w:3},{name:'Plantas e Cortes',w:3},{name:'Diagramação e Layout',w:2},{name:'Escala e Cotas',w:2},{name:'Perspectivas',w:2}] },
  maquete:        { label:'Maquete Física',        icon:'📐', cat:'outros',  input:'img',
    hint: 'Envie fotos da maquete de diferentes ângulos para uma avaliação completa da volumetria e acabamento.',
    criteria:[{name:'Precisão e Escala',w:3},{name:'Qualidade do Acabamento',w:3},{name:'Leitura Espacial',w:2},{name:'Uso de Materiais',w:2},{name:'Apresentação',w:2}] },
  produto:        { label:'Design de Produto',     icon:'📦', cat:'outros',  input:'img',
    hint: 'Envie renders ou fotos do produto. Inclua diferentes vistas (frontal, lateral, perspectiva) para avaliação completa.',
    criteria:[{name:'Funcionalidade',w:3},{name:'Ergonomia',w:3},{name:'Estética e Forma',w:2},{name:'Materiais e Produção',w:2},{name:'Inovação',w:2}] },
};

export const PLANS = {
  gratuito: {
    id: 'gratuito',
    label: 'Gratuito',
    price: 0,
    priceLabel: 'R$ 0/mês',
    color: '#6b7280',
    limits: {
      avaliacoes: 5,
      perfis: 1,
      exercicios: 3,       // null = ilimitado
      relatorios: 0,
      chatbot: 0,
    },
    features: {
      avaliacaoIndividual: true,
      avaliacaoLote: false,
      tomDeProfessor: true,
      criteriosCustom: true,
      edicaoAntesPDF: true,
      pdfIndividual: true,
      exportCSV: false,
      relatorioAluno: false,
      relatorioTurma: false,
      historicoCompleto: true,
      filtrosAvancados: false,
      chatbot: false,
      multiplosPerfisProfessor: false,
      exerciciosReutilizaveis: true,
      exerciciosIlimitados: false,
      suportePrioritario: false,
    },
  },

  essencial: {
    id: 'essencial',
    label: 'Essencial',
    price: 29,
    priceLabel: 'R$ 29/mês',
    color: '#2563eb',
    limits: {
      avaliacoes: 120,
      perfis: 3,
      exercicios: null,
      relatorios: 0,
      chatbot: 50,
    },
    features: {
      avaliacaoIndividual: true,
      avaliacaoLote: true,
      tomDeProfessor: true,
      criteriosCustom: true,
      edicaoAntesPDF: true,
      pdfIndividual: true,
      exportCSV: true,
      relatorioAluno: false,
      relatorioTurma: false,
      historicoCompleto: true,
      filtrosAvancados: false,
      chatbot: true,
      multiplosPerfisProfessor: true,
      exerciciosReutilizaveis: true,
      exerciciosIlimitados: true,
      suportePrioritario: false,
    },
  },

  pro: {
    id: 'pro',
    label: 'Pro',
    price: 59,
    priceLabel: 'R$ 59/mês',
    color: '#7c3aed',
    limits: {
      avaliacoes: 300,
      perfis: null,
      exercicios: null,
      relatorios: 10,
      chatbot: 150,
    },
    features: {
      avaliacaoIndividual: true,
      avaliacaoLote: true,
      tomDeProfessor: true,
      criteriosCustom: true,
      edicaoAntesPDF: true,
      pdfIndividual: true,
      exportCSV: true,
      relatorioAluno: true,
      relatorioTurma: true,
      historicoCompleto: true,
      filtrosAvancados: true,
      chatbot: true,
      multiplosPerfisProfessor: true,
      exerciciosReutilizaveis: true,
      exerciciosIlimitados: true,
      suportePrioritario: false,
    },
  },

  premium: {
    id: 'premium',
    label: 'Premium',
    price: 119,
    priceLabel: 'R$ 119/mês',
    color: '#d97706',
    limits: {
      avaliacoes: 600,
      perfis: null,
      exercicios: null,
      relatorios: 30,
      chatbot: 300,
    },
    features: {
      avaliacaoIndividual: true,
      avaliacaoLote: true,
      tomDeProfessor: true,
      criteriosCustom: true,
      edicaoAntesPDF: true,
      pdfIndividual: true,
      exportCSV: true,
      relatorioAluno: true,
      relatorioTurma: true,
      historicoCompleto: true,
      filtrosAvancados: true,
      chatbot: true,
      multiplosPerfisProfessor: true,
      exerciciosReutilizaveis: true,
      exerciciosIlimitados: true,
      suportePrioritario: true,
    },
  },
};

// Pacotes de avaliações extras (não expiram, acumulam em quota_extra)
// Disponível para Essencial, Pro e Premium
export const ADDONS = [
  { id: 'extra_50',  label: '50 avaliações extras',  qty: 50,  price: 15 },
  { id: 'extra_100', label: '100 avaliações extras', qty: 100, price: 25 },
];

// Pacotes de relatórios extras (não expiram, acumulam em quota_relatorios_extra)
// Disponível para Pro e Premium
export const REPORT_ADDONS = [
  { id: 'extra_rel_5',  label: '5 relatórios extras',  qty: 5,  price: 19 },
  { id: 'extra_rel_10', label: '10 relatórios extras', qty: 10, price: 35 },
];

export const TONES = [
  { id:'neutro',       label:'Neutro',       desc:'Direto e equilibrado' },
  { id:'construtivo',  label:'Construtivo',  desc:'Equilibra crítica com sugestões' },
  { id:'encorajador',  label:'Encorajador',  desc:'Valoriza o esforço e motiva' },
  { id:'rigoroso',     label:'Rigoroso',     desc:'Exigente, padrões elevados' },
  { id:'didatico',     label:'Didático',     desc:'Explica o raciocínio de cada ponto' },
  { id:'informal',     label:'Informal',     desc:'Conversa direta e descontraída' },
  { id:'formal',       label:'Formal',       desc:'Parecer acadêmico oficial' },
];

export function scoreToGrade(s) {
  if (s >= 9) return 'A';
  if (s >= 7) return 'B';
  if (s >= 5) return 'C';
  if (s >= 3) return 'D';
  return 'F';
}

export function scoreColor(s) {
  if (s >= 7) return { bg: '#dcfce7', text: '#16a34a' };
  if (s >= 5) return { bg: '#fef9c3', text: '#ca8a04' };
  return { bg: '#fee2e2', text: '#dc2626' };
}
