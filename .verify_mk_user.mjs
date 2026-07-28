import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const email = 'lb.claude.verify.2026@gmail.com';
const password = 'Verify-Test-2026!';

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { display_name: 'Verification Tester' } },
});
console.log('signUp error:', error?.message ?? 'none');
console.log('session returned:', !!data?.session);
console.log('user id:', data?.user?.id ?? 'none');
