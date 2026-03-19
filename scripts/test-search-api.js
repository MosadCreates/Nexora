const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function checkKey() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key || '');
  const modelName = 'gemini-1.5-flash';
  
  console.log(`\nTesting googleSearchRetrieval without apiVersion...`);
  try {
    const m1 = genAI.getGenerativeModel({ model: modelName, tools: [{ googleSearchRetrieval: {} }] });
    await m1.generateContent("Hello");
    console.log(`Success! googleSearchRetrieval works.`);
  } catch (err) {
    console.log(`Failed. Error:`, err.message.substring(0, 150));
  }

  console.log(`\nTesting googleSearch without apiVersion...`);
  try {
    const m2 = genAI.getGenerativeModel({ model: modelName, tools: [{ googleSearch: {} }] });
    await m2.generateContent("Hello");
    console.log(`Success! googleSearch works.`);
  } catch (err) {
    console.log(`Failed. Error:`, err.message.substring(0, 150));
  }
}

checkKey();
