const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testFallback() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key || '');
  
  console.log('--- Step 1: Trying with Search (Should Fail 429) ---');
  try {
    const modelWithSearch = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      tools: [{ googleSearchRetrieval: {} }]
    }, { apiVersion: 'v1beta' });
    await modelWithSearch.generateContent("What is the current price of Bitcoin?");
    console.log('Search Success (Unexpected)');
  } catch (error) {
    if (error.message.includes('429')) {
      console.log('Search Failed with 429 as expected. Attempting Fallback...');
      
      console.log('--- Step 2: Trying WITHOUT Search (Fallback) ---');
      try {
        const modelNoSearch = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash'
        }, { apiVersion: 'v1beta' });
        const result = await modelNoSearch.generateContent("What is the current price of Bitcoin?");
        console.log('Fallback Success! Response:', result.response.text().substring(0, 100) + '...');
      } catch (fallbackError) {
        console.error('Fallback Failed:', fallbackError.message);
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFallback();
