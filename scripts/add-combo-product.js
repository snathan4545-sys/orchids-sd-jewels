const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw'
});

async function main() {
  // original_price is the strikethrough price, price is the discounted price
  await client.execute("UPDATE products SET original_price = 1399, price = 989 WHERE name = 'Blooms Gift box combo - 5'");
  console.log('Updated Blooms Gift box combo - 5');
  
  await client.execute("UPDATE products SET original_price = 1399, price = 989 WHERE name = 'Blooms Gift box combo - 2'");
  console.log('Updated Blooms Gift box combo - 2');
  
  await client.execute("UPDATE products SET original_price = 1099, price = 899 WHERE name = 'Blooms Gift box combo - 3'");
  console.log('Updated Blooms Gift box combo - 3');
}

main().catch(console.error);
