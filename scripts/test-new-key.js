const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log('Available Models (v1beta):');
    if (data.models) {
      data.models.forEach(m => {
        console.log(`- ${m.name}`);
      });
    } else {
      console.log('No models found or error:', data);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      // No search tool to keep it simple and check basic connectivity
    }, { apiVersion: 'v1beta' });

    console.log(`\nTesting ${modelName} basic connectivity...`);
    const result = await model.generateContent("Say hello");
    console.log(`Success with ${modelName}! Response: ${result.response.text()}`);
  } catch (error) {
    if (error.message.includes('429')) {
       console.error(`429 Error testing ${modelName}: Quota exhausted.`);
    } else {
       console.error(`Error testing ${modelName}:`, error.message);
    }
  }
}

async function run() {
  console.log('Using Key ending in:', process.env.GEMINI_API_KEY?.slice(-4));
  await listModels();
  await testModel('gemini-2.0-flash'); // Using 2.0 as it's more stable
  await testModel('gemini-1.5-flash');
}

run();
