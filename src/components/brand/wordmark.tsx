import Image from 'next/image';
import Link from 'next/link';

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="Light Bearers"
        width={42}
        height={42}
        className="rounded-md object-contain"
        priority
      />

      <span className="text-xl font-semibold tracking-tight">Light Bearers</span>
    </Link>
  );
}
