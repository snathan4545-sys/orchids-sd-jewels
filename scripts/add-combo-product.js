const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw'
});

async function main() {
  // Find all duplicate "Blooms Gift box combo - 1" entries
  const result = await client.execute("SELECT id, name FROM products WHERE name = 'Blooms Gift box combo - 1'");
  console.log('Found entries:', result.rows);
  
  // Delete all of them
  const deleteResult = await client.execute("DELETE FROM products WHERE name = 'Blooms Gift box combo - 1'");
  console.log('Deleted', deleteResult.rowsAffected, 'entries');
}

main().catch(console.error);
