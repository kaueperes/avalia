import './globals.css';
import Script from 'next/script';
import { Suspense } from 'react';
import MetaPixelRouteTracker from './components/MetaPixel';
import { PIXEL_ID } from '@/lib/pixel';

export const metadata = {
  title: 'Kriteria — Avaliação Inteligente para Educadores',
  description: 'O Kriteria corrige trabalhos de alunos com os critérios e o estilo do professor — mais rápido, com qualidade e consistência.',
  icons: { icon: '/imagens/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Script id="meta-pixel-base" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
        </noscript>
        <Suspense fallback={null}>
          <MetaPixelRouteTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
