global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjzqbugelzeppvdadioi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqenFidWdlbHplcHB2ZGFkaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODk4NTUsImV4cCI6MjA5ODM2NTg1NX0.kFcDRDuscVaL5HVg6FYpF4skvAqJ_-rMkxJwVzOl8I0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newSkills = [
  { name: 'HTML', category: 'Frontend - Language' },
  { name: 'CSS', category: 'Frontend - Language' },
  { name: 'JavaScript', category: 'Frontend - Language' },
  
  { name: 'React', category: 'Frontend - Framework' },
  { name: 'Vue', category: 'Frontend - Framework' },
  { name: 'Angular', category: 'Frontend - Framework' },
  
  { name: 'jQuery', category: 'Frontend - Libraries' },
  { name: 'Tailwind CSS', category: 'Frontend - Libraries' },
  { name: 'Bootstrap', category: 'Frontend - Libraries' },
  
  { name: 'Node.js', category: 'Backend - Language' },
  { name: 'Python', category: 'Backend - Language' },
  { name: 'PHP', category: 'Backend - Language' },
  { name: 'Ruby', category: 'Backend - Language' },
  { name: 'Java', category: 'Backend - Language' },
  
  { name: 'MySQL', category: 'Backend - Database' },
  { name: 'MongoDB', category: 'Backend - Database' },
  { name: 'PostgreSQL', category: 'Backend - Database' },
  
  { name: 'REST', category: 'Backend - API' },
  { name: 'GraphQL', category: 'Backend - API' },
];

async function run() {
  console.log("Fetching existing skills...");
  const { data: existing, error: fetchErr } = await supabase.from('skills').select('*');
  
  if (fetchErr) {
    console.error("Error fetching:", fetchErr);
    return;
  }
  
  console.log(`Found ${existing.length} existing skills.`);

  for (const skill of newSkills) {
    const exists = existing.find(s => 
      s.name.toLowerCase() === skill.name.toLowerCase() || 
      (s.name === 'HTML5' && skill.name === 'HTML') || 
      (s.name === 'ReactJS' && skill.name === 'React') ||
      (s.name === 'Tailwind' && skill.name === 'Tailwind CSS')
    );
    
    if (exists) {
      console.log(`Updating ${skill.name}...`);
      await supabase.from('skills').update({ name: skill.name, category: skill.category }).eq('id', exists.id);
    } else {
      console.log(`Inserting ${skill.name}...`);
      await supabase.from('skills').insert({ name: skill.name, category: skill.category, sort: existing.length + 10 });
    }
  }
  
  const otherUpdates = {
    'Laravel': 'Backend - Framework',
    'Next.js': 'Frontend - Framework',
    'TypeScript': 'Frontend - Language',
    'Figma': 'Tools',
    'Git': 'Tools'
  };
  
  for (const [name, cat] of Object.entries(otherUpdates)) {
    const exists = existing.find(s => s.name === name);
    if (exists) {
       console.log(`Updating remaining category for ${name}...`);
       await supabase.from('skills').update({ category: cat }).eq('id', exists.id);
    }
  }
  
  console.log("Done!");
}

run();
