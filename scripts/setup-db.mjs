import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = 'https://qczjisuztjekkjgnqnpl.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjemppc3V6dGpla2tqZ25xbnBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUxMzcxMCwiZXhwIjoyMDkxMDg5NzEwfQ.zO06Y-s8Y07cAwmqgLSN5sFEPr9x2_obW2IjjlILLII';

const supabase = createClient(url, key);

// Test connection by trying to query categories
const { data, error } = await supabase.from('categories').select('count').limit(1);
if (error && error.code === '42P01') {
  console.log('Tables do not exist yet. Please run the schema.sql in Supabase SQL Editor.');
  console.log('Opening SQL Editor URL...');
  console.log('URL: https://supabase.com/dashboard/project/qczjisuztjekkjgnqnpl/sql/new');
  process.exit(1);
} else if (error) {
  console.log('Connection OK but got error:', error.message);
} else {
  console.log('Connection OK! Tables exist.');
}

// ========= SEED DATA =========
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data', file), 'utf-8'));
}

const categoryDefs = [
  { slug: 'entrees', name: 'Entrées', icon: '🥗', type: 'standard', file: 'entrees.json' },
  { slug: 'specialites', name: 'Spécialités Maison', icon: '⭐', type: 'standard', file: 'specialites.json' },
  { slug: 'viandes', name: 'Viandes', icon: '🥩', type: 'standard', file: 'viandes.json' },
  { slug: 'poissons', name: 'Poissons', icon: '🐟', type: 'standard', file: 'poissons.json' },
  { slug: 'mijotes', name: 'Cuisine Mijotée', icon: '🍲', type: 'standard', file: 'mijotes.json' },
  { slug: 'legumes', name: 'Légumes', icon: '🥬', type: 'standard', file: 'legumes.json' },
  { slug: 'accompagnements', name: 'Accompagnements', icon: '🍚', type: 'standard', file: 'accompagnements.json' },
  { slug: 'desserts', name: 'Desserts', icon: '🍮', type: 'standard', file: 'desserts.json' },
  { slug: 'formules', name: 'Formules Midi', icon: '📋', type: 'formules', file: 'formules.json' },
  { slug: 'boissons', name: 'Boissons', icon: '🥤', type: 'boissons', file: 'boissons.json' },
];

console.log('\n🌱 Seeding database...\n');

// Clear existing data
await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
await supabase.from('formule_conditions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
await supabase.from('boisson_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

for (let i = 0; i < categoryDefs.length; i++) {
  const def = categoryDefs[i];
  const jsonData = readJson(def.file);

  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .insert({ slug: def.slug, name: def.name, icon: def.icon, type: def.type, display_order: i })
    .select()
    .single();

  if (catErr || !cat) {
    console.error(`❌ Category ${def.slug}:`, catErr?.message);
    continue;
  }
  console.log(`✅ Category: ${def.name}`);

  if (def.type === 'boissons') {
    for (let j = 0; j < jsonData.categories.length; j++) {
      const subcat = jsonData.categories[j];
      const { data: sub, error: subErr } = await supabase
        .from('boisson_subcategories')
        .insert({ category_id: cat.id, name: subcat.name, image: subcat.image || null, display_order: j })
        .select()
        .single();

      if (subErr || !sub) { console.error(`  ❌ ${subcat.name}:`, subErr?.message); continue; }

      const items = subcat.items.map((item, k) => ({
        category_id: cat.id, boisson_subcategory_id: sub.id,
        name: item.name, price: item.price, display_order: k,
      }));
      const { error: iErr } = await supabase.from('menu_items').insert(items);
      if (iErr) console.error(`  ❌ Items ${subcat.name}:`, iErr.message);
      else console.log(`  📦 ${subcat.name}: ${items.length} items`);
    }
  } else if (def.type === 'formules') {
    const items = jsonData.formules.map((f, k) => ({
      category_id: cat.id, name: f.name, price: f.price, display_order: k,
    }));
    const { error: iErr } = await supabase.from('menu_items').insert(items);
    if (iErr) console.error(`  ❌ Formules:`, iErr.message);
    else console.log(`  📦 ${items.length} formules`);

    const { error: cErr } = await supabase
      .from('formule_conditions')
      .insert({ category_id: cat.id, conditions: jsonData.conditions });
    if (cErr) console.error(`  ❌ Conditions:`, cErr.message);
    else console.log(`  📝 Conditions saved`);
  } else {
    const items = jsonData.map((item, k) => ({
      category_id: cat.id, name: item.name, price: item.price,
      image: item.image || null, accompagnement: item.accompagnement || null,
      badge: item.badge || null, display_order: k,
    }));
    const { error: iErr } = await supabase.from('menu_items').insert(items);
    if (iErr) console.error(`  ❌ Items:`, iErr.message);
    else console.log(`  📦 ${items.length} items`);
  }
}

// Create admin user
console.log('\n👤 Creating admin user...');
const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
  email: 'sugacanebeat@gmail.com',
  password: 'ChezMamanJolie2024!',
  email_confirm: true,
  user_metadata: { role: 'admin' },
});
if (authErr) {
  if (authErr.message.includes('already been registered')) {
    console.log('  ℹ️ Admin user already exists');
    // Update metadata to ensure role is set
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users?.users?.find(u => u.email === 'sugacanebeat@gmail.com');
    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, { user_metadata: { role: 'admin' } });
      console.log('  ✅ Admin role updated');
    }
  } else {
    console.error('  ❌ Admin user:', authErr.message);
  }
} else {
  console.log(`  ✅ Admin user created: ${authUser.user.email}`);
}

console.log('\n✅ Setup complete!');
console.log('\n📋 Admin login:');
console.log('   Email: sugacanebeat@gmail.com');
console.log('   Password: ChezMamanJolie2024!');
console.log('   URL: https://chezmamanjolie.com/admin/login');
