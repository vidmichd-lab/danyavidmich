import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const casesFile = join(rootDir, 'src', 'data', 'cases.json');
const cacheDir = join(rootDir, '.ai-cache');
const envFile = join(rootDir, '.env');

// Load .env file if it exists
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

// Ensure cache directory exists
if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir, { recursive: true });
}

const cases = JSON.parse(readFileSync(casesFile, 'utf-8'));

// Support both OpenAI and Yandex GPT
const yandexApiKey = process.env.YANDEX_API_KEY;
const yandexFolderId = process.env.YANDEX_FOLDER_ID;
const openaiApiKey = process.env.OPENAI_API_KEY;
const provider = process.env.AI_PROVIDER || (yandexApiKey ? 'yandex' : 'openai');

if (!yandexApiKey && !openaiApiKey) {
  console.log('⚠️  No API key set. Using fallback content generation.');
  console.log('Set YANDEX_API_KEY and YANDEX_FOLDER_ID for Yandex GPT');
  console.log('Or set OPENAI_API_KEY for OpenAI');
  process.exit(0);
}

if (provider === 'yandex' && (!yandexApiKey || !yandexFolderId)) {
  console.error('❌ Yandex GPT requires both YANDEX_API_KEY and YANDEX_FOLDER_ID');
  process.exit(1);
}

const DEFAULT_STYLE_GUIDE = `You are a professional copywriter for a design portfolio. Write concise, professional descriptions in English.

Style guidelines:
- Use active voice
- Be specific about achievements and impact
- Mention key technologies/tools when relevant
- Keep descriptions concise (50-80 words for short, 100-150 for long)
- Focus on design decisions and outcomes
- Use professional terminology
- Avoid generic phrases
- Be factual and results-oriented`;

async function generateContent(caseEntry) {
  const cacheFile = join(cacheDir, `${caseEntry.id}.json`);
  
  // Check cache
  if (existsSync(cacheFile)) {
    const cached = JSON.parse(readFileSync(cacheFile, 'utf-8'));
    console.log(`✓ Using cached content for ${caseEntry.id}`);
    return cached;
  }

  // Build prompt with original text if available
  const originalText = caseEntry.originalText || caseEntry.originalDescription || '';
  const hasOriginalText = originalText && originalText.trim().length > 0;
  
  const prompt = `${DEFAULT_STYLE_GUIDE}

Project information:
- Title: ${caseEntry.title}
- Category: ${caseEntry.tag}
- Description tag: ${caseEntry.description || 'N/A'}
${hasOriginalText ? `- Original description: ${originalText}` : ''}

${hasOriginalText ? `IMPORTANT: Use the original description above as the PRIMARY SOURCE. Rewrite it in a professional, concise style while preserving ALL specific details, facts, numbers, technologies, and achievements mentioned. Do not add generic information that wasn't in the original.` : ''}

Generate content for this design project:

1. Short description (50-80 words): For cards, OG tags, and previews. Focus on what was designed and key outcomes. ${hasOriginalText ? 'Extract key facts from the original description.' : ''}

2. Long description (100-150 words): For project detail pages. Include context, design approach, and results. ${hasOriginalText ? 'Rewrite the original description professionally, keeping all specific details, dates, numbers, and technologies.' : ''}

3. Subtitle: A concise tagline (5-10 words) for the project header.

Return JSON format:
{
  "shortDescription": "...",
  "longDescription": "...",
  "subtitle": "..."
}`;

  try {
    console.log(`Generating content for ${caseEntry.id} using ${provider}...`);
    
    let response;
    
    if (provider === 'yandex') {
      // Yandex GPT API
      response = await fetch(`https://llm.api.cloud.yandex.net/foundationModels/v1/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Api-Key ${yandexApiKey}`,
          "x-folder-id": yandexFolderId,
        },
        body: JSON.stringify({
          modelUri: `gpt://${yandexFolderId}/yandexgpt/latest`,
          completionOptions: {
            stream: false,
            temperature: 0.7,
            maxTokens: "500",
          },
          messages: [
            {
              role: "system",
              text: DEFAULT_STYLE_GUIDE,
            },
            {
              role: "user",
              text: prompt,
            },
          ],
        }),
      });
    } else {
      // OpenAI API
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: DEFAULT_STYLE_GUIDE,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    // Parse response based on provider
    let aiResponse;
    if (provider === 'yandex') {
      aiResponse = data.result?.alternatives?.[0]?.message?.text || "";
    } else {
      aiResponse = data.choices[0]?.message?.content || "";
    }
    
    // Parse JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }
    
    const content = JSON.parse(jsonMatch[0]);
    
    // Save to cache
    writeFileSync(cacheFile, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`✓ Generated and cached content for ${caseEntry.id}`);
    
    return content;
  } catch (error) {
    console.error(`✗ Error generating content for ${caseEntry.id}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🤖 Generating AI content for all projects...\n');
  
  const results = [];
  for (const caseEntry of cases) {
    const content = await generateContent(caseEntry);
    if (content) {
      results.push({ id: caseEntry.id, ...content });
    }
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save all results to a single file
  const outputFile = join(rootDir, 'src', 'data', 'ai-content.json');
  writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
  
  console.log(`\n✅ Generated content for ${results.length} projects`);
  console.log(`📁 Saved to ${outputFile}`);
}

main().catch(console.error);

