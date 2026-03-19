const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listAvailableModels() {
  try {
    const key = process.env.GEMINI_API_KEY;
    console.log('Testing with Key ending in:', key?.slice(-4));
    
    // Test v1beta models
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      console.log('Failed to fetch models list! Status:', response.status);
      const text = await response.text();
      console.log('Response:', text);
      return;
    }
    
    const data = await response.json();
    console.log('\nAvailable Models (v1beta) - specifically looking for gemini-*:');
    let foundGemini = false;
    if (data.models) {
      data.models.forEach(m => {
        if (m.name.includes('gemini')) {
          console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
          foundGemini = true;
        }
      });
    }
    
    if (!foundGemini) {
       console.log("No gemini models found in the list!");
    }
  } catch (error) {
    console.error('Diagnostic Script Error:', error.message);
  }
}

listAvailableModels();
