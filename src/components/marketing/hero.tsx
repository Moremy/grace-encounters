'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useLocaleContext } from '@/lib/i18n/locale-context';

const heroText = {
  en: {
    title: 'Be the Light. Preserve the Truth.',
    subtitle: 'Shining Truth. Transforming Lives.',
    learn: 'Learn More',
    about: 'About Us',
  },
  es: {
    title: 'Sé la Luz. Preserva la Verdad.',
    subtitle: 'Verdad que ilumina. Vidas transformadas.',
    learn: 'Saber Más',
    about: 'Sobre Nosotros',
  },
  fr: {
    title: 'Sois la Lumière. Préserve la Vérité.',
    subtitle: 'La vérité qui éclaire. Des vies transformées.',
    learn: 'En Savoir Plus',
    about: 'À Propos',
  },
  pt: {
    title: 'Seja a Luz. Preserve a Verdade.',
    subtitle: 'Verdade que ilumina. Vidas transformadas.',
    learn: 'Saiba Mais',
    about: 'Sobre Nós',
  },
  sw: {
    title: 'Kuwa Nuru. Linda Ukweli.',
    subtitle: 'Ukweli unaong'aa. Maisha yanayobadilishwa.',
    learn: 'Jifunze Zaidi',
    about: 'Kutuhusu',
  },
  ko: {
    title: '빛이 되십시오. 진리를 지키십시오.',
    subtitle: '진리를 비추고 삶을 변화시킵니다.',
    learn: '더 알아보기',
    about: '소개',
  },
};

export function Hero() {
  const { locale } = useLocaleContext();
  const text = heroText[locale] ?? heroText.en;

  return (
    <section className="grid min-h-[420px] grid-cols-1 overflow-hidden bg-[#1A3A3A] md:min-h-[480px] md:grid-cols-[55%_45%]">
      <div className="flex items-center bg-[#1A3A3A] px-8 py-16 md:px-12 lg:px-16">
        <div className="w-full max-w-xl motion-safe:animate-fade-up">
          <h1 className="text-balance font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            {text.title}
          </h1>
          <p className="mt-4 text-base text-white/85 md:text-lg">{text.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="default"
              asChild
              className="bg-burgundy text-white hover:bg-burgundy/90"
            >
              <Link href="/#about">{text.learn}</Link>
            </Button>
            <Button
              variant="outline"
              size="default"
              asChild
              className="border-white bg-transparent text-white hover:bg-white hover:text-teal"
            >
              <Link href="/about">{text.about}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[260px] bg-[#1A3A3A] md:min-h-0">
        <Image
          src="/images/lighthouse.jpg"
          alt="A lighthouse shining out over the sea at dusk"
          fill
          priority
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover object-center md:object-contain md:object-right-bottom"
        />
      </div>
    </section>
  );
}