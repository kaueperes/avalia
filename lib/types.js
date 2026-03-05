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
    criteria:[{name:'Topologia / Edge Flow',w:3},{name:'Proporção e Forma',w:3},{name:'Limpeza (N-gons)',w:2},{name:'Complexidade Técnica',w:1},{name:'Organização',w:1}] },
  animacao:       { label:'Animação 3D',           icon:'▶', cat:'3d',     input:'img',
    criteria:[{name:'Timing e Spacing',w:3},{name:'Arcos de Movimento',w:3},{name:'Squash & Stretch',w:2},{name:'Antecipação',w:2},{name:'Follow-through',w:2}] },
  render:         { label:'Render',                icon:'🖼', cat:'3d',     input:'img',
    criteria:[{name:'Qualidade Visual Geral',w:3},{name:'Materiais e Texturas',w:3},{name:'Iluminação',w:2},{name:'Composição',w:2},{name:'Pós-processamento',w:1}] },
  iluminacao:     { label:'Iluminação 3D',         icon:'☀', cat:'3d',     input:'img',
    criteria:[{name:'Qualidade das Sombras',w:3},{name:'Contraste e Exposição',w:3},{name:'Temperatura de Cor',w:2},{name:'Luz de Preenchimento',w:2},{name:'Realismo',w:2}] },
  rigging:        { label:'Rigging',               icon:'🦴', cat:'3d',     input:'img',
    criteria:[{name:'Estrutura dos Ossos',w:3},{name:'Pesos de Deformação',w:3},{name:'Controladores',w:2},{name:'Hierarquia',w:2},{name:'Nomeação',w:1}] },
  texturizacao:   { label:'Texturização',          icon:'🎨', cat:'3d',     input:'img',
    criteria:[{name:'Qualidade do Unwrap',w:3},{name:'Resolução e Detalhes',w:3},{name:'Coerência Visual',w:2},{name:'Materiais PBR',w:2},{name:'Seamless (costuras)',w:2}] },

  // Visual
  design_grafico: { label:'Design Gráfico',        icon:'◼', cat:'visual',  input:'img',
    criteria:[{name:'Composição e Hierarquia',w:3},{name:'Tipografia',w:3},{name:'Paleta de Cores',w:2},{name:'Conceito e Ideia',w:2},{name:'Acabamento Técnico',w:2}] },
  fotografia:     { label:'Fotografia',            icon:'📷', cat:'visual',  input:'img',
    criteria:[{name:'Exposição e Luminosidade',w:3},{name:'Composição e Enquadramento',w:3},{name:'Foco e Nitidez',w:2},{name:'Narrativa Visual',w:2},{name:'Pós-processamento',w:1}] },
  ilustracao:     { label:'Ilustração Digital',    icon:'✏', cat:'visual',  input:'img',
    criteria:[{name:'Técnica de Desenho',w:3},{name:'Uso de Cor',w:3},{name:'Proporção e Anatomia',w:2},{name:'Estilo e Expressividade',w:2},{name:'Acabamento',w:2}] },
  storyboard:     { label:'Storyboard',            icon:'🎬', cat:'visual',  input:'img',
    criteria:[{name:'Sequência Narrativa',w:3},{name:'Clareza dos Planos',w:3},{name:'Linguagem Cinematográfica',w:2},{name:'Expressão dos Personagens',w:2},{name:'Indicações Técnicas',w:1}] },
  ux_ui:          { label:'UX/UI Design',          icon:'⬜', cat:'visual',  input:'img',
    criteria:[{name:'Usabilidade e Clareza',w:3},{name:'Consistência Visual',w:3},{name:'Hierarquia da Informação',w:2},{name:'Acessibilidade',w:2},{name:'Componentes e Grid',w:2}] },
  moda:           { label:'Design de Moda',        icon:'👗', cat:'visual',  input:'img',
    criteria:[{name:'Conceito e Identidade',w:3},{name:'Ficha Técnica',w:3},{name:'Proporções e Silhueta',w:2},{name:'Escolha de Materiais',w:2},{name:'Apresentação Visual',w:1}] },

  // Texto
  redacao:        { label:'Redação / Artigo',      icon:'📝', cat:'texto',   input:'text',
    criteria:[{name:'Argumentação e Coerência',w:3},{name:'Estrutura do Texto',w:3},{name:'Gramática e Ortografia',w:2},{name:'Repertório e Referências',w:2},{name:'Conclusão',w:2}] },
  roteiro:        { label:'Roteiro',               icon:'🎭', cat:'texto',   input:'text',
    criteria:[{name:'Estrutura Dramática',w:3},{name:'Qualidade dos Diálogos',w:3},{name:'Desenvolvimento de Personagens',w:2},{name:'Formatação Técnica',w:2},{name:'Originalidade',w:2}] },
  game_design:    { label:'Game Design Doc',       icon:'🎮', cat:'texto',   input:'text',
    criteria:[{name:'Clareza e Completude',w:3},{name:'Viabilidade do Conceito',w:3},{name:'Mecânicas de Jogo',w:3},{name:'Experiência do Jogador',w:2},{name:'Originalidade',w:2}] },
  tcc:            { label:'TCC / Monografia',      icon:'📚', cat:'texto',   input:'text',
    criteria:[{name:'Problema e Hipótese',w:3},{name:'Revisão Bibliográfica',w:3},{name:'Metodologia',w:2},{name:'Análise de Resultados',w:2},{name:'Normas ABNT',w:2}] },
  musica_partitura:{ label:'Partitura',            icon:'🎵', cat:'texto',   input:'img',
    criteria:[{name:'Harmonia e Progressão',w:3},{name:'Melodia',w:3},{name:'Ritmo e Métrica',w:2},{name:'Estrutura da Composição',w:2},{name:'Notação Musical',w:2}] },

  // Código
  programacao:    { label:'Programação',           icon:'💻', cat:'codigo',  input:'text',
    criteria:[{name:'Lógica e Algoritmo',w:3},{name:'Boas Práticas',w:3},{name:'Legibilidade',w:2},{name:'Eficiência',w:2},{name:'Documentação',w:1}] },
  web:            { label:'HTML/CSS/JS',           icon:'🌐', cat:'codigo',  input:'text',
    criteria:[{name:'HTML Semântico',w:3},{name:'CSS e Layout',w:3},{name:'JavaScript / Interatividade',w:2},{name:'Responsividade',w:2},{name:'Boas Práticas Web',w:2}] },
  shader:         { label:'Shader',                icon:'✦', cat:'codigo',  input:'text',
    criteria:[{name:'Efeito Visual Alcançado',w:3},{name:'Lógica do Shader',w:3},{name:'Eficiência (performance)',w:2},{name:'Originalidade',w:2},{name:'Documentação',w:1}] },

  // Outros
  arquitetura_img:{ label:'Prancha Arquitetônica', icon:'🏗', cat:'outros',  input:'img',
    criteria:[{name:'Clareza da Representação',w:3},{name:'Plantas e Cortes',w:3},{name:'Diagramação e Layout',w:2},{name:'Escala e Cotas',w:2},{name:'Perspectivas',w:2}] },
  maquete:        { label:'Maquete Física',        icon:'📐', cat:'outros',  input:'img',
    criteria:[{name:'Precisão e Escala',w:3},{name:'Qualidade do Acabamento',w:3},{name:'Leitura Espacial',w:2},{name:'Uso de Materiais',w:2},{name:'Apresentação',w:2}] },
  produto:        { label:'Design de Produto',     icon:'📦', cat:'outros',  input:'img',
    criteria:[{name:'Funcionalidade',w:3},{name:'Ergonomia',w:3},{name:'Estética e Forma',w:2},{name:'Materiais e Produção',w:2},{name:'Inovação',w:2}] },
};

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
