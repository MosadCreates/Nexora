const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function checkKey() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing with Key ending in:', key?.slice(-4));
  const genAI = new GoogleGenerativeAI(key || '');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent("Hello, simple test.");
    console.log(`Success! Response:`, result.response.text());
  } catch (err) {
    console.error(`Error without search (gemini-2.0-flash):`, err.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hello, simple test.");
    console.log(`Success! Response:`, result.response.text());
  } catch (err) {
    console.error(`Error without search (gemini-1.5-flash):`, err.message);
  }
}

checkKey();
