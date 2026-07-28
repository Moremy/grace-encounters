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
    scripture: '"You are the light of the world." — Matthew 5:14',
    learn: 'Learn More',
    about: 'About Us',
  },
  es: {
    title: 'Sé la Luz. Preserva la Verdad.',
    subtitle: 'Verdad que ilumina. Vidas transformadas.',
    scripture: '"Vosotros sois la luz del mundo." — Mateo 5:14',
    learn: 'Saber Más',
    about: 'Sobre Nosotros',
  },
  fr: {
    title: 'Sois la Lumière. Préserve la Vérité.',
    subtitle: 'La vérité qui éclaire. Des vies transformées.',
    scripture: '"Vous êtes la lumière du monde." — Matthieu 5:14',
    learn: 'En Savoir Plus',
    about: 'À Propos',
  },
  pt: {
    title: 'Seja a Luz. Preserve a Verdade.',
    subtitle: 'Verdade que ilumina. Vidas transformadas.',
    scripture: '"Vós sois a luz do mundo." — Mateus 5:14',
    learn: 'Saiba Mais',
    about: 'Sobre Nós',
  },
  sw: {
    title: 'Kuwa Nuru. Linda Ukweli.',
    subtitle: "Ukweli unaong'aa. Maisha yanayobadilishwa.",
    scripture: '"Ninyi ni nuru ya ulimwengu." — Mathayo 5:14',
    learn: 'Jifunze Zaidi',
    about: 'Kutuhusu',
  },
  ko: {
    title: '빛이 되십시오. 진리를 지키십시오.',
    subtitle: '진리를 비추고 삶을 변화시킵니다.',
    scripture: '"너희는 세상의 빛이라." — 마태복음 5:14',
    learn: '더 알아보기',
    about: '소개',
  },
};

export function Hero() {
  const { locale } = useLocaleContext();
  const text = heroText[locale] ?? heroText.en;

  return (
    <section className="relative grid min-h-[380px] grid-cols-1 overflow-hidden md:min-h-[440px] md:grid-cols-[55%_45%]">
      {/* Left content */}
      <div className="relative flex items-center bg-[#1A3A3A] px-8 py-12 md:px-12 lg:px-16">
        {/* Gold accent line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#C9A84C] via-[#C9A84C]/60 to-transparent" />

        <div className="w-full max-w-xl motion-safe:animate-fade-up">
          {/* Label */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
            Light Bearers Ministry
          </p>

          <h1 className="text-balance font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            {text.title}
          </h1>

          <p className="mt-3 text-sm text-white/80 md:text-base">{text.subtitle}</p>

          {/* Scripture */}
          <p className="mt-4 border-l-2 border-[#C9A84C]/60 pl-3 text-xs italic text-white/60">
            {text.scripture}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="default"
              asChild
              className="bg-[#7A1E2E] text-white hover:bg-[#7A1E2E]/90"
            >
              <Link href="/#about">{text.learn}</Link>
            </Button>
            <Button
              variant="outline"
              size="default"
              asChild
              className="border-white/60 bg-transparent text-white hover:bg-white hover:text-[#1A3A3A]"
            >
              <Link href="/about">{text.about}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right image */}
      <div className="relative min-h-[240px] md:min-h-0">
        <Image
          src="/images/lighthouse.jpg"
          alt="A lighthouse shining out over the sea at dusk"
          fill
          priority
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover object-center md:object-cover md:object-right"
        />
        {/* Gradient overlay blending into left panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A3A3A] via-[#1A3A3A]/20 to-transparent md:from-[#1A3A3A]/40 md:via-transparent" />
      </div>
    </section>
  );
}