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
    <section className="grid min-h-[560px] grid-cols-1 overflow-hidden bg-[#1A3A3A] md:min-h-[620px] md:grid-cols-[55%_45%]">
      <div className="flex items-center bg-[#1A3A3A] px-12 py-24 md:px-16 lg:px-24">
        <div className="w-full max-w-xl motion-safe:animate-fade-up">
          <h1 className="text-balance font-serif text-5xl leading-tight text-white sm:text-6xl md:text-7xl">
            {text.title}
          </h1>
          <p className="mt-6 text-xl text-white/85 md:text-2xl">{text.subtitle}</p>
          <p className="mt-4 text-sm italic text-white/50">{text.scripture}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" asChild className="bg-burgundy text-white hover:bg-burgundy/90">
              <Link href="/#about">{text.learn}</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white bg-transparent text-white hover:bg-white hover:text-teal"
            >
              <Link href="/about">{text.about}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[320px] bg-[#1A3A3A] md:min-h-0">
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