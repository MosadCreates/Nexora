const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function checkKey() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key || '');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent("Hello, simple test.");
  } catch (err) {
    fs.writeFileSync('error_20_flash.txt', err.message);
  }
}

checkKey();
