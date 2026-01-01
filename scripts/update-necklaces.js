const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw'
});

async function main() {
  // 1. Update Gold-Tone Blue Gemstone Link Necklace Set: original price 799, discounted price 699
  await client.execute("UPDATE products SET original_price = 799, price = 699 WHERE id = 219");
  console.log('Updated Gold-Tone Blue Gemstone Link Necklace Set');
  
  // 2. Delete Green Vine Pearl Chain
  await client.execute("DELETE FROM products WHERE id = 126");
  console.log('Deleted Green Vine Pearl Chain');
  
  // 3. Update Eternal Teardrop Necklace: original price 759, discounted price 569
  await client.execute("UPDATE products SET original_price = 759, price = 569 WHERE id = 122");
  console.log('Updated Eternal Teardrop Necklace');
  
  console.log('All updates completed!');
}

main().catch(console.error);
