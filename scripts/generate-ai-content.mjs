import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const casesFile = join(rootDir, 'src', 'data', 'cases.json');
const cacheDir = join(rootDir, '.ai-cache');

// Ensure cache directory exists
if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir, { recursive: true });
}

const cases = JSON.parse(readFileSync(casesFile, 'utf-8'));
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.log('⚠️  OPENAI_API_KEY not set. Using fallback content generation.');
  console.log('Set OPENAI_API_KEY environment variable to enable AI content generation.');
  process.exit(0);
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

  const prompt = `${DEFAULT_STYLE_GUIDE}

Project information:
- Title: ${caseEntry.title}
- Category: ${caseEntry.tag}
- Description tag: ${caseEntry.description || 'N/A'}

Generate content for this design project:

1. Short description (50-80 words): For cards, OG tags, and previews. Focus on what was designed and key outcomes.

2. Long description (100-150 words): For project detail pages. Include context, design approach, and results.

3. Subtitle: A concise tagline (5-10 words) for the project header.

Return JSON format:
{
  "shortDescription": "...",
  "longDescription": "...",
  "subtitle": "..."
}`;

  try {
    console.log(`Generating content for ${caseEntry.id}...`);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";
    
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

