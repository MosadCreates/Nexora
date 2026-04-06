import fetch from 'node-fetch';

async function main() {
  console.log('Sending request...');
  const res = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: 'Notion competitors' })
  });

  console.log('Response status:', res.status);
  
  if (!res.ok) {
    const text = await res.text();
    console.log('Error text:', text);
    return;
  }

  const { Readable } = require('stream');
  const stream = Readable.from(res.body);

  let buffer = '';
  for await (const chunk of stream) {
    const text = chunk.toString();
    console.log('--- CHUNK ---');
    console.log(text);
    buffer += text;
  }
}

main().catch(console.error);
