import { permanentRedirect } from 'next/navigation';

// The faith-news content has been merged into /events. Anyone hitting an
// old /news link or bookmark is sent straight to the news section of the
// combined Events & Updates page.
export default function NewsPage() {
  permanentRedirect('/events#news');
}
