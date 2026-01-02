const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw'
});

async function main() {
  const now = new Date().toISOString();
  const images = JSON.stringify(['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Chain-1-1767382929501.jpeg?width=8000&height=8000&resize=contain']);
  
  const result = await client.execute({
    sql: `INSERT INTO products (name, description, price, category, images, in_stock, featured, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'Blooms Gift box combo - 5',
      'Contains 6 Rings, 3 Earring, 1 2nd stud, 1 Chain',
      999,
      'combo',
      images,
      1,
      0,
      now,
      now
    ]
  });
  console.log('Added Blooms Gift box combo - 5 to combo section');
  console.log('Insert result:', result);
}

main().catch(console.error);
