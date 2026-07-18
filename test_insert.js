const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');

const supabaseUrl = 'https://hjzqbugelzeppvdadioi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqenFidWdlbHplcHB2ZGFkaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODk4NTUsImV4cCI6MjA5ODM2NTg1NX0.kFcDRDuscVaL5HVg6FYpF4skvAqJ_-rMkxJwVzOl8I0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const { data, error } = await supabase.from('projects').insert([{
    title: "Test",
    category: "Web App",
    description: "test",
    tags: ["Test"],
    link: "https://test.com",
    github: "https://github.com",
    thumbnail: "",
    sort: 0
  }]);
  
  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Success:", data);
  }
}

testInsert();
