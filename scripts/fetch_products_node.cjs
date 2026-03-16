const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local
let token = '';
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  const match = envContent.match(/POLAR_ORGANIZATION_TOKEN=["']?([^"'\n]+)["']?/);
  if (match) {
    token = match[1];
  }
} catch (error) {
  console.error('Could not read .env.local', error);
  process.exit(1);
}

if (!token) {
  console.error('POLAR_ORGANIZATION_TOKEN not found');
  process.exit(1);
}

const options = {
  hostname: 'api.polar.sh',
  path: '/v1/products/?is_archived=false',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(data);
    } else {
      console.error(`Status Code: ${res.statusCode}`);
      if (res.statusCode === 307 || res.statusCode === 301 || res.statusCode === 302) {
          console.error(`Location: ${res.headers.location}`);
      }
      console.error(data);
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
