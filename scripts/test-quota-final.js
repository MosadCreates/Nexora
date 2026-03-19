const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function checkKey() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing with Key ending in:', key?.slice(-4));
  const genAI = new GoogleGenerativeAI(key || '');
  
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting ${modelName} with search tool...`);
      const modelWithSearch = genAI.getGenerativeModel({ 
        model: modelName,
        tools: [{ googleSearchRetrieval: {} }]
      }, { apiVersion: 'v1beta' });
      await modelWithSearch.generateContent("Hello");
      console.log(`${modelName} success with search!`);
    } catch (err) {
      console.log(`${modelName} Search failed:`, err.message.substring(0, 150) + '...');
      
      try {
        console.log(`Testing ${modelName} WITHOUT search tool...`);
        const modelNoSearch = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
        await modelNoSearch.generateContent("Hello");
        console.log(`${modelName} success without search!`);
      } catch (err2) {
        console.log(`${modelName} No-search failed:`, err2.message.substring(0, 150) + '...');
      }
    }
  }
}

checkKey();
