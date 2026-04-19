import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const supabase = createClient(url, key);

console.log('Creating menu-images bucket...');

// Create bucket
const { data: bucket, error: bucketErr } = await supabase.storage.createBucket('menu-images', {
  public: true,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
});

if (bucketErr) {
  if (bucketErr.message.includes('already exists')) {
    console.log('Bucket already exists, updating to public...');
    await supabase.storage.updateBucket('menu-images', {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    });
  } else {
    console.error('Error:', bucketErr.message);
    process.exit(1);
  }
}

console.log('Bucket ready!');

// List buckets to confirm
const { data: buckets } = await supabase.storage.listBuckets();
console.log('Available buckets:', buckets?.map(b => b.name).join(', '));
