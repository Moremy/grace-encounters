import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'claude.verify.tester@lightbearers.local',
  password: 'Verify-Test-2026!',
});
console.log('signIn error:', error?.message ?? 'none');
console.log('session:', !!data?.session);
console.log('user id:', data?.user?.id ?? 'none');
