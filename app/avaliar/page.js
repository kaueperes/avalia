'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TYPES, CATEGORIES, TONES, scoreToGrade, scoreColor } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';
import mammoth from 'mammoth';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

const CAT_ICONS = {
  '3d':          <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  audiovisual:   <><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></>,
  design:        <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></>,
  musica:        <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  texto:         <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  codigo:        <><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></>,
  arquitetura:   <><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/></>,
  arte:          <><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>,
  saude:         <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
  linguas:       <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  outros:        <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
};

const TYPE_ICONS = {
  // 3D e Animação
  modelagem:              <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  animacao:               <polygon points="5 3 19 12 5 21 5 3"/>,
  animacao_2d:            <><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/><circle cx="18" cy="6" r="2"/></>,
  rigging:                <><path d="M17 10c.7-.7 1.69-.7 2.5 0a1.77 1.77 0 0 1 0 2.5c-.7.7-1.69.7-2.5 0L7 3c-.7-.7-.7-1.69 0-2.5a1.77 1.77 0 0 1 2.5 0c.7.7.7 1.69 0 2.5"/><path d="M7 14c-.7.7-1.69.7-2.5 0a1.77 1.77 0 0 1 0-2.5c.7-.7 1.69-.7 2.5 0L17 21c.7.7.7 1.69 0 2.5a1.77 1.77 0 0 1-2.5 0c-.7-.7-.7-1.69 0-2.5"/></>,
  texturizacao:           <><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>,
  iluminacao:             <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  render:                 <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  vfx:                    <><path d="m4 14 1.5-7.5L2 5l4-3 4 3-3.5 1.5L8 14"/><path d="M16.5 4 19 2l4 3-3.5 1.5L21 14l-5-2-5 2 1.5-7.5"/><path d="M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></>,
  simulacao:              <><path d="M3 6h3a2 2 0 0 1 2 2v10"/><path d="M21 6h-3a2 2 0 0 0-2 2v10"/><path d="M12 6v4"/><path d="M8 18h8"/><path d="M5 3h14"/><circle cx="12" cy="20" r="2"/></>,
  // Audiovisual
  storyboard:             <><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></>,
  edicao_video:           <><path d="M2 8h20"/><path d="M2 12h20"/><path d="M2 16h20"/><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 9 5 3-5 3V9z" fill="currentColor"/></>,
  motion_graphics:        <><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h1"/><path d="M14 3h1"/><path d="M14 21h1"/><path d="M3 9v1"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M21 14v1"/><circle cx="12" cy="12" r="3"/></>,
  colorgrading:           <><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 8v8"/><path d="M8 12h8"/></>,
  apresentacao_oral:      <><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect x="3" y="4" width="18" height="12" rx="2"/><circle cx="12" cy="10" r="3"/></>,
  locucao:                <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></>,
  // Design
  design_grafico:         <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></>,
  ilustracao:             <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>,
  ux_ui:                  <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
  concept_art:            <><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></>,
  identidade_visual:      <><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></>,
  design_embalagem:       <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>,
  tipografia:             <><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></>,
  fotografia:             <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
  moda:                   <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>,
  // Música e Áudio
  musica_partitura:       <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  composicao_audio:       <><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></>,
  producao_musical:       <><circle cx="12" cy="12" r="2"/><path d="M4.93 4.93c-1.3 1.3-2.13 2.96-2.38 4.74C2.3 11.45 2.3 12.55 2.55 14.33c.25 1.78 1.08 3.44 2.38 4.74"/><path d="M19.07 4.93c1.3 1.3 2.13 2.96 2.38 4.74.25 1.78.25 2.88 0 4.66-.25 1.78-1.08 3.44-2.38 4.74"/><path d="M7.76 7.76c-.78.78-1.28 1.77-1.44 2.84-.16 1.07-.16 2.16 0 3.23.16 1.07.66 2.06 1.44 2.84"/><path d="M16.24 7.76c.78.78 1.28 1.77 1.44 2.84.16 1.07.16 2.16 0 3.23-.16 1.07-.66 2.06-1.44 2.84"/></>,
  arranjo_musical:        <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  sound_design:           <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>,
  trilha_sonora:          <><rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20"/><path d="M2 12h5"/><path d="M2 7h5"/><path d="M2 17h5"/><polygon points="11 8 20 12 11 16 11 8"/></>,
  // Texto e Escrita
  redacao:                <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  roteiro:                <><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 3H8.5a2.5 2.5 0 0 0 0 5H12"/></>,
  tcc:                    <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  game_design:            <><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></>,
  copywriting:            <><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></>,
  poesia:                 <><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10"/><path d="M13 22c-1.5-2-3-5-3-10s1.5-8 3-10"/><path d="M2 12h10"/><path d="M12 12h10"/><path d="M18 16l4 4-4 4"/></>,
  critica:                <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  // Código e Tecnologia
  programacao:            <><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></>,
  web:                    <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  mobile:                 <><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  banco_dados:            <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  shader:                 <><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/></>,
  game_dev:               <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M7 12h.01"/><path d="M17 12h.01"/><path d="M12 8v8"/></>,
  // Arquitetura e Engenharia
  arquitetura_img:        <><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/></>,
  bim:                    <><path d="m2 7 10-5 10 5v10l-10 5L2 17V7z"/><path d="M12 22V12"/><path d="m2 7 10 5 10-5"/><path d="M7 4.5v5"/><path d="M17 4.5v5"/></>,
  maquete:                <><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z"/><path d="m9 9 5 5"/><path d="M14 9h1"/><path d="M14 12h1"/><path d="M14 15h1"/></>,
  maquete_digital:        <><path d="M12 3 2 7.5l10 4.5 10-4.5L12 3z"/><path d="M2 7.5v9l10 4.5 10-4.5v-9"/><path d="M12 12v9"/></>,
  desenho_tecnico:        <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><path d="M8 9h1"/></>,
  interiores:             <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  paisagismo:             <><path d="M17 8c.7 1.5 1 3 1 5a6 6 0 0 1-12 0c0-2 .3-3.5 1-5"/><path d="M12 2v6"/><path d="M8 6c.5.5 1 1.5 1 3"/><path d="M16 6c-.5.5-1 1.5-1 3"/></>,
  engenharia_civil:       <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  // Arte e Artesanato
  pintura:                <><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></>,
  escultura:              <><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m8 12 2 2 4-4"/></>,
  ceramica:               <><path d="M8.5 2h7l1 5H7.5l1-5z"/><path d="M3 7h18l-2 13H5L3 7z"/><path d="M9 11v4"/><path d="M12 11v4"/><path d="M15 11v4"/></>,
  gravura:                <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18"/><path d="M3 7h4"/><path d="M3 12h4"/><path d="M3 17h4"/><path d="M11 8l6 4-6 4V8z" fill="currentColor"/></>,
  arte_textil:            <><path d="M10 3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5z"/><path d="M19 3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5z"/><path d="M10 9a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h5z"/><path d="M19 9a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h5z"/><path d="M10 15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h5z"/><path d="M19 15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h5z"/></>,
  // Educação Física e Saúde
  exercicio:              <><path d="M6.5 6.5a4.5 4.5 0 1 0 6.364 6.364"/><path d="m20 20-6.36-6.36"/><path d="M2 2l20 20"/></>,
  danca:                  <><circle cx="12" cy="4" r="2"/><path d="m10.7 10.7-3.5 6.1 3.9-1.5 1.6 3.2 2.2-5.5"/><path d="m14 7-2 3-1.5-1 3-2.5"/></>,
  tecnica_esportiva:      <><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v4"/><path d="m16.24 7.76-2.83 2.83"/><path d="M22 2 12 12"/></>,
  // Línguas e Acessibilidade
  libras:                 <><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></>,
  traducao:               <><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></>,
  producao_oral:          <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1"/></>,
  // Outros
  produto:                <><path d="m12.89 1.45 8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/><polyline points="2.32 6.16 12 11 21.68 6.16"/><line x1="12" y1="22.76" x2="12" y2="11"/></>,
  gastronomia:            <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></>,
  projeto_interdisciplinar:<><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></>,
};

export default function AvaliarPage() {
  const router = useRouter();
  const resultPanelRef = useRef(null);
  const studentFileRef = useRef(null);
  const cameraRef = useRef(null);
  const referenceFilesRef = useRef(null);
  const studentRefFilesRef = useRef(null);
  const batchFilesRef = useRef(null);
  const extraFilesRef = useRef(null);
  const [userName, setUserName] = useState('Professor');
  const [profiles, setProfiles] = useState([]);
  const [exercises, setExercises] = useState([]);

  // Perfil
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profName, setProfName] = useState('');
  const [profDisc, setProfDisc] = useState('');
  const [profTurma, setProfTurma] = useState('');
  const [profInstitution, setProfInstitution] = useState('');
  const [writingSample, setWritingSample] = useState('');

  // Tipo e exercício
  const [activeCat, setActiveCat] = useState('3d');
  const [selectedType, setSelectedType] = useState('modelagem');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDisciplina, setExerciseDisciplina] = useState('');
  const [exerciseContext, setExerciseContext] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [newCritName, setNewCritName] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(2);

  // Modo de avaliação
  const [evalMode, setEvalMode] = useState('individual');

  // Aluno
  const [tone, setTone] = useState('neutro');
  const [studentName, setStudentName] = useState('');
  const [resolvedStudentName, setResolvedStudentName] = useState('');
  const [studentWork, setStudentWork] = useState('');
  const [studentMatricula, setStudentMatricula] = useState('');
  const [studentFile, setStudentFile] = useState(null);
  const [studentFiles, setStudentFiles] = useState([]); // para obj (múltiplos)
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [referenceWeight, setReferenceWeight] = useState('parcial');
  const [studentRefFiles, setStudentRefFiles] = useState([]);
  const [batchFiles, setBatchFiles] = useState([]);
  const [filePattern, setFilePattern] = useState('nome_matricula');
  const [dragZone, setDragZone] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);

  // Resultado
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cota
  const [quotaCiclo, setQuotaCiclo] = useState(null);
  const [quotaExtra, setQuotaExtra] = useState(null);

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.name) setUserName(u.name);
      setQuotaCiclo(typeof u.quota_ciclo === 'number' ? u.quota_ciclo : null);
      setQuotaExtra(typeof u.quota_extra === 'number' ? u.quota_extra : null);
    } catch {}
    setCriteria((TYPES['modelagem']?.criteria || []).map(c => ({ name: c.name, weight: c.w })));
    Promise.all([
      fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/exercises', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([p, e]) => {
      setProfiles(Array.isArray(p) ? p : []);
      setExercises(Array.isArray(e) ? e : []);
    }).catch(() => {});
  }, [router]);

  function loadProfile(id) {
    setSelectedProfileId(id);
    if (!id) { setProfName(''); setProfDisc(''); setProfTurma(''); setProfInstitution(''); setWritingSample(''); setTone('neutro'); return; }
    const p = profiles.find(p => p.id === id);
    if (!p) return;
    setProfName(p.name || '');
    setProfDisc(p.discipline || '');
    setProfTurma(p.turma || '');
    setProfInstitution(p.institution || '');
    setWritingSample(p.writingSample || '');
    if (p.tone) setTone(p.tone);
  }

  function switchType(type) {
    setSelectedType(type);
    setSelectedExerciseId('');
    setCriteria((TYPES[type]?.criteria || []).map(c => ({ name: c.name, weight: c.w })));
  }

  function loadExercise(id) {
    setSelectedExerciseId(id);
    if (!id) return;
    const ex = exercises.find(e => e.id === id);
    if (!ex) return;
    setSelectedType(ex.type);
    setActiveCat(TYPES[ex.type]?.cat || '3d');
    setExerciseName(ex.name || '');
    setExerciseDisciplina(ex.disciplina || '');
    setExerciseContext(ex.context || '');
    setCriteria(ex.criteria?.map(c => ({ name: c.name, weight: c.weight || 1 })) || (TYPES[ex.type]?.criteria || []).map(c => ({ name: c.name, weight: c.w })));
  }

  function addCriteria() {
    if (!newCritName.trim()) return;
    setCriteria(prev => [...prev, { name: newCritName.trim(), weight: newCritWeight }]);
    setNewCritName(''); setNewCritWeight(2);
  }

  function extractNameFromFile(file) {
    if (!file) return '';
    const base = file.name.replace(/\.[^.]+$/, ''); // remove extension
    const parts = base.split(/[_\-\s]+/);
    const nameParts = parts.filter(p => !/^\d+$/.test(p)); // remove pure numbers (matricula)
    return nameParts.join(' ').trim();
  }

  async function runEvaluation() {
    if (!exerciseName.trim()) return;
    setGenerating(true);
    setEvalError('');
    setResult(null);
    setSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    try {
      let workContent = studentWork;
      const fileForName = studentFile || studentFiles[0] || extraFiles[0];
      const resolved = studentName.trim() || extractNameFromFile(fileForName);
      setResolvedStudentName(resolved);

      // Helper: file → base64
      const toBase64 = (file) => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      // Collect all images to send to the AI as vision
      const images = [];

      if (TYPES[selectedType]?.input === 'obj' && studentFiles.length > 0) {
        const objTexts = [];
        for (const f of studentFiles) {
          if (f.name.endsWith('.obj')) {
            try { objTexts.push(await f.text()); } catch { objTexts.push(`[Arquivo: ${f.name}]`); }
          } else if (f.type.startsWith('image/')) {
            images.push({ data: await toBase64(f), mediaType: f.type, label: `Trabalho do aluno: ${f.name}` });
          }
        }
        if (objTexts.length > 0) workContent = objTexts.join('\n\n---\n\n');
      }

      if (TYPES[selectedType]?.input === 'video' && studentFiles.length > 0) {
        for (const f of studentFiles) {
          if (f.size > 20 * 1024 * 1024) {
            setEvalError(`O arquivo "${f.name}" é maior que 20MB. Reduza o tamanho ou exporte em qualidade menor.`);
            setEvaluating(false);
            return;
          }
          images.push({ data: await toBase64(f), mediaType: f.type, label: `Trabalho do aluno: ${f.name}` });
        }
      }

      if (TYPES[selectedType]?.input === 'imgs' && studentFiles.length > 0) {
        for (const f of studentFiles) {
          if (f.type.startsWith('image/')) {
            images.push({ data: await toBase64(f), mediaType: f.type, label: `Trabalho do aluno: ${f.name}` });
          }
        }
      }

      if (TYPES[selectedType]?.input === 'img' && studentFile && studentFile.type.startsWith('image/')) {
        images.push({ data: await toBase64(studentFile), mediaType: studentFile.type, label: `Trabalho do aluno: ${studentFile.name}` });
      }
      for (const f of studentRefFiles) {
        if (f.type.startsWith('image/') || f.type.startsWith('video/') || f.type.startsWith('audio/') || f.name.endsWith('.obj')) {
          images.push({ data: await toBase64(f), mediaType: f.type || 'application/octet-stream', label: `Referência do aluno: ${f.name}` });
        } else if (f.type === 'text/plain' || f.name.endsWith('.txt')) {
          try { workContent = (workContent ? workContent + '\n\n[Referência do aluno]\n' : '[Referência do aluno]\n') + await f.text(); } catch {}
        } else if (f.name.endsWith('.docx')) {
          try {
            const ab = await f.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: ab });
            workContent = (workContent ? workContent + '\n\n[Referência do aluno]\n' : '[Referência do aluno]\n') + result.value;
          } catch {}
        }
      }
      for (const f of referenceFiles) {
        if (f.type.startsWith('image/')) {
          images.push({ data: await toBase64(f), mediaType: f.type, label: `Referência para Correção: ${f.name}` });
        }
      }
      for (const f of extraFiles) {
        if (f.type.startsWith('image/')) {
          images.push({ data: await toBase64(f), mediaType: f.type, label: `Arquivo adicional: ${f.name}` });
        } else if (f.type === 'text/plain' || f.name.endsWith('.txt')) {
          try { workContent = (workContent ? workContent + '\n\n' : '') + await f.text(); } catch {}
        } else if (f.name.endsWith('.docx')) {
          try {
            const ab = await f.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: ab });
            workContent = (workContent ? workContent + '\n\n' : '') + result.value;
          } catch {}
        }
      }

      const r = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, exerciseName, exerciseContext, criteria, studentName: resolved, studentWork: workContent, tone, profName, profDisc, profInstitution, writingSample, images: images.length > 0 ? images : undefined, referenceWeight: referenceWeight }),
      });
      const data = await r.json();
      if (!r.ok) { setEvalError(data.error || 'Erro ao gerar avaliação.'); return; }
      setResult(data);
      // Decrement quota in localStorage
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (typeof u.quota_ciclo === 'number' && u.quota_ciclo > 0) {
          u.quota_ciclo = u.quota_ciclo - 1;
          setQuotaCiclo(u.quota_ciclo);
        } else if (typeof u.quota_extra === 'number' && u.quota_extra > 0) {
          u.quota_extra = u.quota_extra - 1;
          setQuotaExtra(u.quota_extra);
        }
        localStorage.setItem('user', JSON.stringify(u));
        window.dispatchEvent(new Event('storage'));
      } catch {}
    } catch { setEvalError('Erro de conexão. Tente novamente.'); }
    finally { setGenerating(false); }
  }

  async function saveResult() {
    if (!result || saved || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: resolvedStudentName || 'Aluno',
          type: selectedType,
          score: result.score,
          feedback: result.feedback,
          criteria: result.criteriaScores,
          profileName: profName || '',
          turma: profTurma || '',
          exerciseName: exerciseName || '',
          institution: profInstitution || '',
          disciplina: exerciseDisciplina || '',
        }),
      });
      if (r.ok) setSaved(true);
    } finally { setSaving(false); }
  }

  function novaAvaliacao() {
    setResult(null); setSaved(false); setEvalError('');
    setStudentName(''); setStudentWork('');
    setStudentMatricula(''); setStudentFile(null); setStudentFiles([]); setReferenceFiles([]); setBatchFiles([]);
  }

  const hasQuota = quotaCiclo === null || quotaCiclo > 0 || (quotaExtra !== null && quotaExtra > 0);
  const canEval = exerciseName.trim().length > 0 && hasQuota;
  const sc = result ? scoreColor(result.score) : null;

  const inp = {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--bg-content)',
    color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 };
  async function generateContext() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const r = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName, exerciseType: selectedType, briefDescription: aiPrompt }),
      });
      const d = await r.json();
      if (d.context) { setExerciseContext(d.context); setShowAiPrompt(false); setAiPrompt(''); }
    } finally { setAiLoading(false); }
  }

  const maxExtraFiles = selectedType === 'tcc' ? 15 : ['musica_partitura', 'arranjo_musical', 'storyboard'].includes(selectedType) ? 10 : 5;
  const secLabel = { fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 };
  const section = { padding: '22px 24px', borderBottom: '1px solid var(--border-card)' };

  return (
    <AppLayout userName={userName}>

      {/* Header padrão */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Avaliação</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Nova Avaliação</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Configure as opções e gere um feedback personalizado com IA.</p>
      </div>

      {/* Grid 2 colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '560px 1fr', gap: 24, alignItems: 'start' }}>

        {/* COLUNA ESQUERDA — Configuração */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden' }}>

          {/* 1. PERFIL */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Selecione um perfil salvo ou preencha manualmente. O perfil define seus dados e critérios padrão.">Perfil do Professor</Tooltip></div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...inp, flex: 1 }} value={selectedProfileId} onChange={e => loadProfile(e.target.value)}>
                  <option value="">— Selecione um perfil —</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name} · {p.discipline}{p.turma ? ` · ${p.turma}` : ''}{p.institution ? ` · ${p.institution}` : ''}</option>)}
                </select>
                <Link href="/perfis" style={{ width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 18, background: 'var(--bg-content)', flexShrink: 0 }}>+</Link>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}><Tooltip text="Seu nome completo que aparecerá nos relatórios e PDFs das avaliações.">Nome do Professor</Tooltip></label>
              <input style={inp} value={profName} onChange={e => setProfName(e.target.value)} placeholder="Prof. Dr. Fulano de Tal" />
            </div>
            <div className="form-grid">
              <div>
                <label style={lbl}><Tooltip text="Matéria ou disciplina que você leciona. Ex: Design Gráfico, Animação 3D.">Disciplina</Tooltip></label>
                <input style={inp} value={profDisc} onChange={e => setProfDisc(e.target.value)} placeholder="Design Gráfico" />
              </div>
              <div>
                <label style={lbl}><Tooltip text="Identificação da turma. Ex: Turma A, 3º semestre.">Turma</Tooltip></label>
                <input style={inp} value={profTurma} onChange={e => setProfTurma(e.target.value)} placeholder="Turma B" />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={lbl}><Tooltip text="Nome da escola, faculdade ou universidade. Aparece nos relatórios gerados.">Instituição de ensino</Tooltip></label>
              <input style={inp} value={profInstitution} onChange={e => setProfInstitution(e.target.value)} placeholder="Ex: FAAP, USP, Colégio Estadual..." />
            </div>
          </div>

          {/* 2. TIPO */}
          <div style={{ ...section, padding: '18px 0 0 0' }}>
            <div style={{ padding: '0 24px 10px', ...secLabel }}><Tooltip text="Selecione a categoria e o tipo específico do trabalho enviado pelo aluno. Isso define como a IA vai analisar.">Tipo de Trabalho</Tooltip></div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--border-card)' }}>
              {/* Sidebar de categorias */}
              <div style={{ width: 168, flexShrink: 0, borderRight: '1px solid var(--border-card)', padding: '10px 8px', background: 'var(--bg-content)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                  <div key={catKey} onClick={() => setActiveCat(catKey)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    background: activeCat === catKey ? 'var(--selected-bg)' : 'transparent',
                    border: `1px solid ${activeCat === catKey ? '#0081f033' : 'transparent'}`,
                    color: activeCat === catKey ? '#0081f0' : 'var(--text-sub)',
                    fontWeight: activeCat === catKey ? 700 : 500,
                    fontSize: 12.5, lineHeight: 1.35, transition: 'all .12s',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>{CAT_ICONS[catKey]}</svg>
                    <span style={{ display: 'grid' }}>
                      <span style={{ fontWeight: 700, visibility: 'hidden', gridArea: '1/1', lineHeight: 'inherit' }}>{cat.label}</span>
                      <span style={{ gridArea: '1/1', lineHeight: 'inherit' }}>{cat.label}</span>
                    </span>
                  </div>
                ))}
              </div>
              {/* Grid de tipos */}
              <div style={{ flex: 1, padding: '12px 12px 16px', minWidth: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {Object.entries(TYPES).filter(([, v]) => v.cat === activeCat).map(([k, v]) => (
                    <div key={k} onClick={() => switchType(k)} style={{
                      padding: '11px 5px', border: `1px solid ${selectedType === k ? '#0081f0' : 'var(--border)'}`,
                      borderRadius: 9, background: selectedType === k ? 'var(--selected-bg)' : 'var(--bg-content)',
                      fontSize: 11.5, fontWeight: selectedType === k ? 700 : 500,
                      color: selectedType === k ? '#0081f0' : 'var(--text-muted)', cursor: 'pointer', textAlign: 'center', lineHeight: 1.35,
                      minHeight: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 20, height: 20, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {TYPE_ICONS[k]}
                        </svg>
                      </div>
                      {v.label}
                    </div>
                  ))}
                </div>
                {TYPES[selectedType] && (
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', padding: '8px 10px', background: 'var(--bg-content)', borderRadius: 8, border: '1px solid var(--border)', lineHeight: 1.5 }}>
                    {TYPES[selectedType].hint}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. EXERCÍCIO */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Defina o exercício a ser avaliado e os critérios que a IA vai usar para pontuar o trabalho.">Exercício & Critérios</Tooltip></div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...inp, flex: 1 }} value={selectedExerciseId} onChange={e => loadExercise(e.target.value)}>
                  <option value="">— Exercício livre —</option>
                  {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <Link href="/exercicios" style={{ width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 18, background: 'var(--bg-content)', flexShrink: 0 }}>+</Link>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}><Tooltip text="Nome obrigatório do exercício. Aparece no relatório de avaliação gerado.">Nome do Exercício *</Tooltip></label>
              <input style={inp} value={exerciseName} onChange={e => setExerciseName(e.target.value)} placeholder="Ex: Exercício 3 — Modelagem de Personagem" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={lbl}><Tooltip text="Descreva o que foi pedido ao aluno. Quanto mais detalhado, melhor será a avaliação da IA.">Enunciado / Descrição</Tooltip></label>
                <button onClick={() => setShowAiPrompt(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', border: '1px solid #0081f033', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'var(--selected-bg)', color: '#0081f0' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2v4h4"/></svg>
                  Criar com IA
                </button>
              </div>
              {showAiPrompt && (
                <div style={{ marginBottom: 8, padding: '10px 12px', background: 'var(--selected-bg)', border: '1px solid #0081f033', borderRadius: 10 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Descreva o exercício brevemente e a IA gera o enunciado completo:</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      style={{ ...inp, flex: 1, fontSize: 12, padding: '7px 10px' }}
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generateContext()}
                      placeholder="Ex: modelagem de personagem low poly, foco em otimização..."
                      autoFocus
                    />
                    <button onClick={generateContext} disabled={aiLoading || !aiPrompt.trim()} style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer', opacity: !aiPrompt.trim() ? 0.5 : 1, flexShrink: 0 }}>
                      {aiLoading ? 'Gerando...' : 'Gerar'}
                    </button>
                  </div>
                </div>
              )}
              <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} value={exerciseContext} onChange={e => setExerciseContext(e.target.value)} placeholder="Descreva o objetivo e requisitos do exercício..." />
            </div>
            <div>
              <label style={{ ...lbl, marginBottom: 8 }}><Tooltip text="Cada critério recebe nota de 0 a 10. O peso (×) multiplica a importância do critério na nota final.">Critérios</Tooltip></label>
              {criteria.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 9, marginBottom: 6, fontSize: 13 }}>
                  <input
                    value={c.name}
                    onChange={e => { const cr = [...criteria]; cr[i] = { ...cr[i], name: e.target.value }; setCriteria(cr); }}
                    style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: 13, outline: 'none', minWidth: 0 }}
                  />
                  <select
                    value={c.weight}
                    onChange={e => { const cr = [...criteria]; cr[i] = { ...cr[i], weight: Number(e.target.value) }; setCriteria(cr); }}
                    style={{ fontSize: 11, background: 'var(--selected-bg)', color: '#0081f0', border: '1px solid #0081f033', borderRadius: 4, padding: '2px 4px', flexShrink: 0, cursor: 'pointer' }}
                  >
                    <option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option>
                  </select>
                  <span onClick={() => setCriteria(criteria.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={newCritName} onChange={e => setNewCritName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCriteria()} placeholder="Novo critério..." />
                <select style={{ ...inp, width: 64 }} value={newCritWeight} onChange={e => setNewCritWeight(Number(e.target.value))}>
                  <option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option>
                </select>
                <button onClick={addCriteria} style={{ width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 9, background: 'var(--bg-content)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>+</button>
              </div>
            </div>
          </div>

          {/* 4. MODO */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Individual: avalia um aluno por vez. Lote: envie vários arquivos e avalie todos de uma só vez.">Modo de Avaliação</Tooltip></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div onClick={() => setEvalMode('individual')} style={{
                padding: '12px 10px', border: `1px solid ${evalMode === 'individual' ? '#0081f0' : 'var(--border)'}`,
                borderRadius: 10, background: evalMode === 'individual' ? 'var(--selected-bg)' : 'var(--bg-content)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={evalMode === 'individual' ? '#0081f0' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: evalMode === 'individual' ? 700 : 500, color: evalMode === 'individual' ? '#0081f0' : 'var(--text-muted)' }}>Individual</div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>Avalia um aluno por vez</div>
                </div>
              </div>
              <div onClick={() => setEvalMode('lote')} style={{
                padding: '12px 10px', border: `1px solid ${evalMode === 'lote' ? '#0081f0' : 'var(--border)'}`,
                borderRadius: 10, background: evalMode === 'lote' ? 'var(--selected-bg)' : 'var(--bg-content)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={evalMode === 'lote' ? '#0081f0' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: evalMode === 'lote' ? 700 : 500, color: evalMode === 'lote' ? '#0081f0' : 'var(--text-muted)' }}>Lote</div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>Múltiplos alunos de uma vez</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. TOM */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Define o estilo do texto gerado pela IA — do mais técnico e direto ao mais encorajador e didático.">Tom do Feedback</Tooltip></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {TONES.map(t => (
                <div key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: '9px 10px', border: `1px solid ${tone === t.id ? '#0081f0' : 'var(--border)'}`,
                  borderRadius: 9, background: tone === t.id ? 'var(--selected-bg)' : 'var(--bg-content)',
                  fontSize: 12, fontWeight: tone === t.id ? 700 : 500,
                  color: tone === t.id ? '#0081f0' : 'var(--text-muted)', cursor: 'pointer', textAlign: 'center',
                }}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* 6. ALUNO & ARQUIVO */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Informe os dados do aluno e envie o arquivo do trabalho para ser avaliado pela IA.">Aluno & Arquivo</Tooltip></div>

            {evalMode === 'individual' ? (
              <>
                {/* Nome do Aluno */}
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>
                    <Tooltip text="Nome do aluno que aparece no relatório. Pode ser deixado vazio se estiver no nome do arquivo.">Nome do Aluno</Tooltip>
                    {TYPES[selectedType]?.input !== 'text' && (
                      <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-sub)', marginLeft: 6 }}>extraído do arquivo se vazio</span>
                    )}
                  </label>
                  <input style={inp} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ex: João Silva — ou deixe vazio" />
                </div>

                {/* Matrícula — só para tipos de arquivo */}
                {TYPES[selectedType]?.input !== 'text' && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl}>
                      <Tooltip text="Número de matrícula do aluno. Opcional — aparece no relatório se preenchido.">Matrícula</Tooltip> <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-sub)' }}>opcional</span>
                    </label>
                    <input style={inp} value={studentMatricula} onChange={e => setStudentMatricula(e.target.value)} placeholder="Ex: 2023001234" />
                  </div>
                )}

                {TYPES[selectedType]?.input === 'text' ? (
                  <>
                    <div>
                      <label style={lbl}><Tooltip text="Cole aqui o trabalho escrito ou código do aluno para a IA analisar e avaliar.">Texto / Código do Aluno</Tooltip></label>
                      <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={studentWork} onChange={e => setStudentWork(e.target.value)} placeholder="Cole aqui o texto ou código do aluno..." />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={lbl}>
                        <Tooltip text="Envie imagens, .txt ou .docx como contexto adicional. O texto do .docx é extraído automaticamente. Útil para prints, diagramas ou anexos.">Imagens e arquivos adicionais</Tooltip> <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}>opcional</span>
                      </label>
                      <input ref={extraFilesRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.txt,.docx" style={{ display: 'none' }} onChange={e => setExtraFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, maxExtraFiles))} />
                      {extraFiles.length > 0 ? (
                        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                          {extraFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < extraFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                              <span style={{ flex: 1, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                              <span onClick={() => setExtraFiles(extraFiles.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                            </div>
                          ))}
                          {extraFiles.length < maxExtraFiles && (
                            <div onClick={() => extraFilesRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais</div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => extraFilesRef.current?.click()}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#0081f0'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                          style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-content)', transition: 'border-color .15s' }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Imagens (JPG, PNG, WEBP), .txt ou .docx · até {maxExtraFiles}</div>
                        </div>
                      )}
                    </div>
                    {selectedType === 'tcc' && !extraFiles.some(f => f.type.startsWith('image/')) && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 10, padding: '10px 12px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 9 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5, margin: 0 }}>Para avaliar <strong>formatação ABNT</strong>, envie como imagem as <strong>páginas-chave</strong>: capa, folha de rosto, sumário, uma página de corpo e referências. O texto (.txt ou .docx) cobre o conteúdo; as imagens cobrem a formatação.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Drop zone principal */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ ...lbl, marginBottom: 8 }}>
                        <Tooltip text="Envie o arquivo do trabalho do aluno: concept, render, obj, etc. Pode combinar arquivos para uma avaliação mais completa.">Arquivo do aluno</Tooltip>
                      </label>
                      <input ref={studentFileRef}
                        type="file"
                        accept={TYPES[selectedType]?.input === 'obj' ? '.obj,image/*' : TYPES[selectedType]?.input === 'video' ? 'video/*,audio/*,image/*' : 'image/*'}
                        multiple={['obj', 'video', 'imgs'].includes(TYPES[selectedType]?.input)}
                        style={{ display: 'none' }}
                        onChange={e => {
                          if (['obj', 'video', 'imgs'].includes(TYPES[selectedType]?.input)) {
                            setStudentFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 10));
                          } else {
                            setStudentFile(e.target.files[0] || null);
                          }
                        }}
                      />

                      {/* Modo OBJ, VIDEO ou IMGS: lista de múltiplos arquivos */}
                      {['obj', 'video', 'imgs'].includes(TYPES[selectedType]?.input) ? (
                        <>
                          {studentFiles.length > 0 && (
                            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              {studentFiles.map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < studentFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0081f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  <span style={{ flex: 1, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{f.name}</span>
                                  <span onClick={() => setStudentFiles(studentFiles.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                                </div>
                              ))}
                              {studentFiles.length < 10 && (
                                <div onClick={() => studentFileRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais</div>
                              )}
                            </div>
                          )}
                          {studentFiles.length === 0 && (
                            <div
                              onClick={() => studentFileRef.current?.click()}
                              onMouseEnter={e => { if (dragZone !== 'student') e.currentTarget.style.borderColor = '#0081f0'; }}
                              onMouseLeave={e => { if (dragZone !== 'student') e.currentTarget.style.borderColor = 'var(--border)'; }}
                              onDragOver={e => { e.preventDefault(); setDragZone('student'); }}
                              onDragLeave={() => setDragZone(null)}
                              onDrop={e => { e.preventDefault(); setDragZone(null); setStudentFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)].slice(0, 10)); }}
                              style={{ border: `2px dashed ${dragZone === 'student' ? '#0081f0' : 'var(--border)'}`, borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: dragZone === 'student' ? 'var(--selected-bg)' : 'var(--bg-content)', transition: 'all .15s' }}
                            >
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                                {TYPES[selectedType]?.input === 'video' ? 'vídeo (MP4, MOV), áudio (MP3, WAV, M4A) e/ou imagens (até 10)' : TYPES[selectedType]?.input === 'imgs' ? 'imagens JPG, PNG, WEBP (até 10)' : '.obj e/ou imagens (até 10)'}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Modo IMG: arquivo único */
                        <>
                          {studentFile ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--selected-bg)', border: '1px solid #0081f033', borderRadius: 10 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0081f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              <span style={{ flex: 1, fontSize: 12, color: '#0081f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{studentFile.name}</span>
                              <span onClick={() => setStudentFile(null)} style={{ color: '#0081f0', cursor: 'pointer', fontSize: 16, opacity: 0.7, lineHeight: 1 }}>×</span>
                            </div>
                          ) : (
                            <div
                              onClick={() => studentFileRef.current?.click()}
                              onMouseEnter={e => { if (dragZone !== 'student') e.currentTarget.style.borderColor = '#0081f0'; }}
                              onMouseLeave={e => { if (dragZone !== 'student') e.currentTarget.style.borderColor = 'var(--border)'; }}
                              onDragOver={e => { e.preventDefault(); setDragZone('student'); }}
                              onDragLeave={() => setDragZone(null)}
                              onDrop={e => { e.preventDefault(); setDragZone(null); const f = e.dataTransfer.files[0]; if (f) setStudentFile(f); }}
                              style={{ border: `2px dashed ${dragZone === 'student' ? '#0081f0' : 'var(--border)'}`, borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: dragZone === 'student' ? 'var(--selected-bg)' : 'var(--bg-content)', transition: 'all .15s' }}
                            >
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>imagem do trabalho</div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Câmera — só para img, aparece em todos os devices mas funciona melhor no mobile */}
                      {TYPES[selectedType]?.input === 'img' && (
                        <>
                          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => setStudentFile(e.target.files[0] || null)} />
                          <button
                            onClick={() => cameraRef.current?.click()}
                            style={{ width: '100%', marginTop: 8, padding: '9px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--bg-content)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            Tirar foto com a câmera
                          </button>
                        </>
                      )}
                    </div>

                    {/* Referências do aluno */}
                    <div>
                      <label style={lbl}>
                        <Tooltip text="Material que o aluno usou como referência ou inspiração. A IA usa como contexto mas não avalia como produção do aluno.">Referências do aluno</Tooltip> <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}>opcional</span>
                      </label>
                      <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 8, lineHeight: 1.5 }}>
                        Imagens, vídeos, áudios, textos ou arquivos que o aluno usou como base. A IA entende o contexto sem confundir com o trabalho dele.
                      </div>
                      <input ref={studentRefFilesRef} type="file" multiple accept="image/*,video/*,audio/*,.obj,.txt,.docx" style={{ display: 'none' }} onChange={e => setStudentRefFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))} />
                      {studentRefFiles.length > 0 ? (
                        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                          {studentRefFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < studentRefFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                              <span style={{ flex: 1, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                              <span onClick={() => setStudentRefFiles(studentRefFiles.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                            </div>
                          ))}
                          {studentRefFiles.length < 5 && (
                            <div onClick={() => studentRefFilesRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais</div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => studentRefFilesRef.current?.click()}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#0081f0'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                          style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-content)', transition: 'all .15s' }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>imagem, vídeo, áudio, .obj, .txt, .docx</div>
                        </div>
                      )}
                    </div>

                    {/* Referência para Correção */}
                    <div style={{ marginTop: 8 }}>
                      <label style={lbl}>
                        <Tooltip text="Envie um gabarito ou imagens de referência. A IA compara com o trabalho do aluno para avaliar melhor.">Referência para Correção</Tooltip> <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}>opcional</span>
                      </label>
                      <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 8, lineHeight: 1.5 }}>
                        Envie o .obj gabarito e/ou imagens de concept (até 4). A IA usa tudo como referência visual e técnica.
                      </div>
                      <input ref={referenceFilesRef} type="file" multiple accept=".obj,image/*" style={{ display: 'none' }} onChange={e => setReferenceFiles(Array.from(e.target.files).slice(0, 4))} />
                      {referenceFiles.length > 0 ? (
                        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                          {referenceFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < referenceFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                              <span style={{ flex: 1, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                              <span onClick={() => setReferenceFiles(referenceFiles.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                            </div>
                          ))}
                          {referenceFiles.length < 4 && (
                            <div onClick={() => referenceFilesRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais</div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => referenceFilesRef.current?.click()}
                          onMouseEnter={e => { if (dragZone !== 'ref') e.currentTarget.style.borderColor = '#0081f0'; }}
                          onMouseLeave={e => { if (dragZone !== 'ref') e.currentTarget.style.borderColor = 'var(--border)'; }}
                          onDragOver={e => { e.preventDefault(); setDragZone('ref'); }}
                          onDragLeave={() => setDragZone(null)}
                          onDrop={e => { e.preventDefault(); setDragZone(null); setReferenceFiles(Array.from(e.dataTransfer.files).slice(0, 4)); }}
                          style={{ border: `2px dashed ${dragZone === 'ref' ? '#0081f0' : 'var(--border)'}`, borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: dragZone === 'ref' ? 'var(--selected-bg)' : 'var(--bg-content)', transition: 'all .15s' }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>.obj + imagens de concept</div>
                        </div>
                      )}
                      <div style={{ marginTop: 10 }}>
                        <label style={{ ...lbl, marginBottom: 4 }}>Peso do gabarito na correção</label>
                        <select style={inp} value={referenceWeight} onChange={e => setReferenceWeight(e.target.value)}>
                          <option value="livre">Referência livre — apenas orientação, valorize a criatividade</option>
                          <option value="parcial">Parcial — considere o gabarito, mas aceite variações</option>
                          <option value="estrito">Estrito — o aluno deve seguir o gabarito de perto</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Lote */
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}><Tooltip text="Informe como os arquivos dos alunos estão nomeados. O sistema extrai nome e matrícula automaticamente.">Padrão do nome do arquivo</Tooltip></label>
                  <select style={inp} value={filePattern} onChange={e => setFilePattern(e.target.value)}>
                    <option value="nome_matricula">nome_matricula · ex: joao_silva_2023001.obj</option>
                    <option value="matricula_nome">matricula_nome · ex: 2023001_joao_silva.obj</option>
                    <option value="nome">nome · ex: joao_silva.obj</option>
                  </select>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 4 }}>Separadores aceitos: _ - · - espaço</div>
                </div>
                <input ref={batchFilesRef} type="file" multiple accept=".obj,image/*,.txt" style={{ display: 'none' }} onChange={e => setBatchFiles(Array.from(e.target.files))} />
                {batchFiles.length > 0 ? (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', background: 'var(--bg-content)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{batchFiles.length} arquivo{batchFiles.length > 1 ? 's' : ''}</span>
                      <span onClick={() => setBatchFiles([])} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 11, fontWeight: 400 }}>Limpar tudo</span>
                    </div>
                    <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                      {batchFiles.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: i < batchFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12, color: 'var(--text-main)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        </div>
                      ))}
                    </div>
                    <div onClick={() => batchFilesRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais arquivos</div>
                  </div>
                ) : (
                  <div
                    onClick={() => batchFilesRef.current?.click()}
                    onMouseEnter={e => { if (dragZone !== 'batch') e.currentTarget.style.borderColor = '#0081f0'; }}
                    onMouseLeave={e => { if (dragZone !== 'batch') e.currentTarget.style.borderColor = 'var(--border)'; }}
                    onDragOver={e => { e.preventDefault(); setDragZone('batch'); }}
                    onDragLeave={() => setDragZone(null)}
                    onDrop={e => { e.preventDefault(); setDragZone(null); setBatchFiles(Array.from(e.dataTransfer.files)); }}
                    style={{ border: `2px dashed ${dragZone === 'batch' ? '#0081f0' : 'var(--border)'}`, borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: dragZone === 'batch' ? 'var(--selected-bg)' : 'var(--bg-content)', transition: 'all .15s' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Clique ou arraste vários arquivos de uma vez</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Aceita .obj, imagens e .txt</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* BOTÃO */}
          <div style={{ padding: '20px 24px' }}>
            {evalError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF444433', color: '#EF4444', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 13 }}>{evalError}</div>
            )}
            <button
              onClick={runEvaluation}
              disabled={!canEval || generating}
              style={{
                width: '100%', padding: '13px', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                background: !canEval || generating ? 'var(--border)' : 'linear-gradient(135deg, #0081f0, #0033ad)',
                color: !canEval || generating ? 'var(--text-sub)' : '#fff',
                cursor: canEval && !generating ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {generating ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Gerando avaliação...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/></svg>
                  Gerar Avaliação com IA
                </>
              )}
            </button>
            {!hasQuota && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF444433', color: '#EF4444', borderRadius: 8, padding: '10px 12px', marginTop: 10, fontSize: 13, textAlign: 'center' }}>
                Você não tem avaliações disponíveis. <a href="/conta" style={{ color: '#EF4444', fontWeight: 700, textDecoration: 'underline' }}>Comprar mais</a>
              </div>
            )}
            {!canEval && hasQuota && <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-sub)', marginTop: 8 }}>Preencha o nome do exercício para continuar</p>}
          </div>
        </div>

        {/* COLUNA DIREITA — Resultado */}
        <div ref={resultPanelRef} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden', minHeight: 480 }}>

          {!result && !generating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '64px 40px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/></svg>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Nenhuma avaliação gerada</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>Configure o perfil, tipo de trabalho e exercício<br/>ao lado e clique em <strong>Gerar Avaliação com IA</strong>.</p>
            </div>
          )}

          {generating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '64px 40px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTop: '3px solid #0081f0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>A IA está avaliando o trabalho...</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Analisando critérios e gerando feedback personalizado</p>
            </div>
          )}

          {result && !generating && (
            <div style={{ padding: 28 }}>
              {/* Cabeçalho do resultado */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Resultado</p>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{resolvedStudentName || 'Aluno'}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {TYPES[selectedType]?.label || selectedType} · {exerciseName}
                    {profTurma ? ` · ${profTurma}` : ''}{profName ? ` · ${profName}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!saved ? (
                    <button onClick={saveResult} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  ) : (
                    <span style={{ padding: '9px 18px', background: '#ECFDF5', border: '1px solid #10B98133', color: '#10B981', borderRadius: 9, fontSize: 13, fontWeight: 600 }}>✓ Salvo</span>
                  )}
                  <button onClick={novaAvaliacao} style={{ padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-muted)' }}>↺ Nova</button>
                </div>
              </div>

              {/* Score */}
              <div style={{ border: '1px solid var(--border-card)', borderRadius: 14, padding: 24, marginBottom: 16, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24 }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-card)', paddingRight: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 48, lineHeight: 1, fontWeight: 800, color: sc.text }}>{result.score.toFixed(1)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>/ 10</div>
                  <div style={{ marginTop: 10, padding: '3px 14px', borderRadius: 20, fontSize: 14, fontWeight: 800, background: sc.bg, color: sc.text }}>{scoreToGrade(result.score)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  {(result.criteriaScores || []).map((c, i) => {
                    const cc = scoreColor(c.score || 0);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-main)', flex: 1 }}>{c.name}</div>
                        <div style={{ width: 100, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${(c.score || 0) * 10}%`, height: '100%', background: cc.text, borderRadius: 99, transition: 'width 0.8s ease' }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: cc.text, width: 30, textAlign: 'right', flexShrink: 0 }}>{(c.score || 0).toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}
              <div style={{ border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-card)' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>Feedback</p>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>Tom: {TONES.find(t => t.id === tone)?.label}{profName ? ` · ${profName}` : ''}</p>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{result.feedback}</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
