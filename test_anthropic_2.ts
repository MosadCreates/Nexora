import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const models = [
    'claude-haiku-4-5-20251001',
  ];

  for (const model of models) {
    try {
      console.log(`Testing model: ${model}`);
      const prompt = "test";
      const anthropicStream = await anthropic.messages.stream({
        model,
        max_tokens: 4096,
        system: `You are an expert competitive intelligence analyst. 
Your job is to analyze competitors and market positioning with deep, 
actionable insights. Always respond with valid JSON only — no markdown, 
no code blocks, no preamble. Your entire response must be parseable JSON.`,
        messages: [{ role: 'user', content: prompt }],
      });
      
      let fullText = '';
      for await (const event of anthropicStream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          process.stdout.write(event.delta.text);
          fullText += event.delta.text;
        }
      }
      console.log(`\nModel ${model} SUCCESS. Text length: ${fullText.length}`);
      return;
    } catch (err: any) {
        console.error(`\nModel ${model} FAILED: ${err.message}`);
    }
  }
}
main();
