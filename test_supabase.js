const url = 'https://hjzqbugelzeppvdadioi.supabase.co/rest/v1/certificates?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqenFidWdlbHplcHB2ZGFkaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODk4NTUsImV4cCI6MjA5ODM2NTg1NX0.kFcDRDuscVaL5HVg6FYpF4skvAqJ_-rMkxJwVzOl8I0';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}).then(res => res.json()).then(console.log).catch(console.error);
