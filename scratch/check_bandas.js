const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function test() {
  const { data, error } = await supabase.from('bandas_organizadas').select('*');
  console.log('Bandas Error:', error);
  console.log('Bandas Data:', data);
  
  const { data: b2, error: e2 } = await supabase.from('grupos_delictivos').select('*');
  console.log('Grupos Error:', e2);
  console.log('Grupos Data:', b2);
}

test();
