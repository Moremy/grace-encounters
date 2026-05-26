'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useLocaleContext } from '@/lib/i18n/locale-context';

const heroText = {
  en: {
    label: 'Light and Salt',
    title: 'Be the Light. Preserve the Truth.',
    subtitle: 'A Christ-centered community for testimonies, prayer, truth, and spiritual growth.',
    share: 'Share Your Testimony',
    read: 'Read Testimonies',
    verse: 'Then they overcame him by the blood of the Lamb and by the word of their testimony.',
    reference: '— Revelation 12:11',
  },
  es: {
    label: 'Luz y Sal',
    title: 'Sé la Luz. Preserva la Verdad.',
    subtitle:
      'Una comunidad centrada en Cristo para testimonios, oración, verdad y crecimiento espiritual.',
    share: 'Comparte tu Testimonio',
    read: 'Leer Testimonios',
    verse: 'Ellos lo vencieron por la sangre del Cordero y por la palabra de su testimonio.',
    reference: '— Apocalipsis 12:11',
  },
  fr: {
    label: 'Lumière et Sel',
    title: 'Sois la Lumière. Préserve la Vérité.',
    subtitle:
      'Une communauté centrée sur Christ pour les témoignages, la prière, la vérité et la croissance spirituelle.',
    share: 'Partager ton Témoignage',
    read: 'Lire les Témoignages',
    verse: 'Ils l’ont vaincu par le sang de l’Agneau et par la parole de leur témoignage.',
    reference: '— Apocalypse 12:11',
  },
  pt: {
    label: 'Luz e Sal',
    title: 'Seja a Luz. Preserve a Verdade.',
    subtitle:
      'Uma comunidade centrada em Cristo para testemunhos, oração, verdade e crescimento espiritual.',
    share: 'Compartilhe seu Testemunho',
    read: 'Ler Testemunhos',
    verse: 'Eles o venceram pelo sangue do Cordeiro e pela palavra do seu testemunho.',
    reference: '— Apocalipse 12:11',
  },
  sw: {
    label: 'Nuru na Chumvi',
    title: 'Kuwa Nuru. Linda Ukweli.',
    subtitle: 'Jamii inayomlenga Kristo kwa shuhuda, maombi, ukweli, na ukuaji wa kiroho.',
    share: 'Shiriki Ushuhuda Wako',
    read: 'Soma Shuhuda',
    verse: 'Nao wakamshinda kwa damu ya Mwana-Kondoo na kwa neno la ushuhuda wao.',
    reference: '— Ufunuo 12:11',
  },
  ko: {
    label: '빛과 소금',
    title: '빛이 되십시오. 진리를 지키십시오.',
    subtitle: '간증, 기도, 진리, 영적 성장을 위한 그리스도 중심의 공동체입니다.',
    share: '간증 나누기',
    read: '간증 읽기',
    verse: '그들은 어린양의 피와 자기들이 증언하는 말씀으로 그를 이겼습니다.',
    reference: '— 요한계시록 12:11',
  },
};

export function Hero() {
  const { locale } = useLocaleContext();
  const text = heroText[locale] ?? heroText.en;

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ivory">
      <div
        aria-hidden="true"
        className="gradient-radial-gold pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-32 text-center">
        <div className="motion-safe:animate-fade-up">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{text.label}</p>

          <h1 className="mt-6 text-balance font-serif text-5xl text-navy md:text-7xl">
            {text.title}
          </h1>

          <p className="mt-6 text-lg text-foreground/80 md:text-xl">{text.subtitle}</p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="sacred" size="lg" asChild>
              <Link href="#share">{text.share}</Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <Link href="#testimonies">{text.read}</Link>
            </Button>
          </div>

          <div className="mt-14 text-muted-foreground">
            <p className="font-serif text-base italic md:text-lg">{text.verse}</p>
            <p className="mt-2 font-serif text-sm">{text.reference}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
