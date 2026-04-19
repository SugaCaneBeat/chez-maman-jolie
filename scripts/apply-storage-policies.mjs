import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const supabase = createClient(url, key);

// Test upload capability with service role
const testContent = Buffer.from('test');
const { error } = await supabase.storage
  .from('menu-images')
  .upload('_test.txt', testContent, { upsert: true });

if (error) {
  console.error('Upload test failed:', error.message);
  console.log('\n⚠️ You need to apply the storage policies manually in Supabase SQL Editor:');
  console.log(fs.readFileSync('scripts/storage-policies.sql', 'utf-8'));
} else {
  console.log('✅ Storage upload works with service role');
  // Cleanup test file
  await supabase.storage.from('menu-images').remove(['_test.txt']);
}

// Try to ensure bucket is public
const { data: buckets } = await supabase.storage.listBuckets();
const bucket = buckets?.find(b => b.name === 'menu-images');
console.log('Bucket info:', bucket);
