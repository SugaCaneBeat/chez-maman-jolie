import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const supabase = createClient(url, key);

// Find the beers subcategory
const { data: subs } = await supabase
  .from('boisson_subcategories')
  .select('*');

console.log('Sous-categories existantes:', subs?.map(s => s.name).join(', '));

const beers = subs?.find(s =>
  s.name.toLowerCase().includes('biere') ||
  s.name.toLowerCase().includes('bière') ||
  s.name.toLowerCase().includes('beer')
);

if (!beers) {
  console.log('❌ Aucune categorie Bieres trouvee');
  process.exit(0);
}

console.log(`Suppression de: ${beers.name} (id: ${beers.id})`);

// Delete menu_items linked to this subcategory first
const { error: itemsErr } = await supabase
  .from('menu_items')
  .delete()
  .eq('boisson_subcategory_id', beers.id);

if (itemsErr) console.error('❌ Items:', itemsErr.message);
else console.log('✅ Items supprimes');

// Delete the subcategory
const { error: subErr } = await supabase
  .from('boisson_subcategories')
  .delete()
  .eq('id', beers.id);

if (subErr) console.error('❌ Sous-categorie:', subErr.message);
else console.log('✅ Sous-categorie supprimee');

console.log('\n✅ Carte bieres supprimee');
