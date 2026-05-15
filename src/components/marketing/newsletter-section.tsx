import { NewsletterForm } from '@/components/email/newsletter-form';

export function NewsletterSection() {
  return (
    <section className="border-t bg-[#f9f7f4] py-16">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] md:text-3xl">
          Stay Connected
        </h2>
        <p className="mt-3 text-muted-foreground">
          Subscribe to our newsletter for weekly devotionals, prayer updates,
          and community news.
        </p>
        <div className="mt-6">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
