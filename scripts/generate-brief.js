import fetch from 'node-fetch';
import fs from 'fs';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const today = new Date().toLocaleDateString('zh-TW', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const PROMPT = `你是一個設計與時尚領域的資訊編輯。今天是 ${today}。

請從 Dezeen 和 It's Nice That 等設計媒體中，找出今天（${today}）或昨天發布的最新文章，共 10 篇。注意：只能選 2026 年 5 月發布的文章，絕對不能使用 2025 年或更早的文章。如果找不到足夠的新文章，寧可減少篇數也不要用舊文章。

對每篇文章，請用以下 JSON 格式整理。只回傳純 JSON，不要任何說明或 markdown：

{
  "articles": [
    {
      "title": "文章標題（中文翻譯或原標題）",
      "source": "媒體來源名稱",
      "category": "設計",
      "url": "文章完整網址（若知道）",
      "summary": "核心摘要，120字以內，這篇在說什麼、為什麼重要",
      "details": "設計語言/工法細節 或 品牌定位/美學方向，具體描述，80字以內",
      "context": "趨勢脈絡：反映了哪些更大的市場或文化走向，80字以內",
      "pov": "給讀者的思考提問或觀點引導，50字以內",
      "tags": ["關鍵字1", "關鍵字2", "關鍵字3", "關鍵字4"]
    }
  ],
  "generated_at": "${new Date().toISOString()}"
}`;

async function generateBrief() {
  console.log('Calling Claude API with web search...');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
     model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search'
        }
      ],
      messages: [
        { role: 'user', content: PROMPT }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Extract text from response
  const textContent = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Parse JSON from response
  const jsonStart = textContent.indexOf('{');
  const jsonEnd = textContent.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No JSON found in response');
  }

  const jsonStr = textContent.substring(jsonStart, jsonEnd + 1);
  const brief = JSON.parse(jsonStr);

  // Validate structure
  if (!brief.articles || !Array.isArray(brief.articles)) {
    throw new Error('Invalid brief structure');
  }

  // Write to file
  fs.writeFileSync('brief.json', JSON.stringify(brief, null, 2), 'utf-8');
  console.log(`✓ Generated brief with ${brief.articles.length} articles`);
  brief.articles.forEach(a => console.log(`  · [${a.category}] ${a.title}`));
}

generateBrief().catch(err => {
  console.error('Failed to generate brief:', err.message);
  process.exit(1);
});
