const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testWithSearch() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing with Key ending in:', key?.slice(-4));
  const genAI = new GoogleGenerativeAI(key || '');
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash', // Flash usually has higher quota
    tools: [{ googleSearchRetrieval: {} }]
  }, { apiVersion: 'v1beta' });

  try {
    console.log('Attempting search-enabled generation...');
    const result = await model.generateContent("What is the current price of Bitcoin?");
    console.log('Success! Response received.');
  } catch (error) {
    console.error('Search Failure:', error.message);
  }
}

testWithSearch();
