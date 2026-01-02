const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw'
});

async function main() {
  const now = new Date().toISOString();
  await client.execute({
    sql: "INSERT INTO products (name, description, price, original_price, images, category, in_stock, featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      'Blooms Gift box combo - 1',
      'Contains 6 Rings, 3 Earring, 1 2nd stud, 1 Anti-tarnish Chain',
      989,
      1399,
      JSON.stringify(['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/chain-2-1767384254616.jpeg']),
      'combo',
      1,
      1,
      now,
      now
    ]
  });
  console.log('Added Blooms Gift box combo - 1');
}

main().catch(console.error);
