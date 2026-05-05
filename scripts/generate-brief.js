import fetch from 'node-fetch';
import fs from 'fs';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const today = new Date().toLocaleDateString('zh-TW', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const PROMPT = `你是一個設計與時尚領域的資訊編輯。今天是 ${today}。

請從 Dezeen 和 It's Nice That 等設計媒體中，找出今天或昨天發布的最新文章，共 4 篇。只能選 2026 年發布的文章，絕對不能使用 2025 年或更早的文章。分成「設計」和「時尚」兩類。

請直接輸出以下 JSON，不要加任何說明文字、不要加 markdown 符號：

{"articles":[{"title":"標題","source":"來源","category":"設計","url":"網址","image_url":"封面圖直接網址或null","summary":"摘要120字內","details":"細節80字內","context":"趨勢80字內","pov":"觀點50字內","tags":["tag1","tag2","tag3"]}],"generated_at":"${new Date().toISOString()}"}`;

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
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: PROMPT }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Collect all text from all content blocks
  const allText = data.content
    .map(b => {
      if (b.type === 'text') return b.text;
      if (b.type === 'tool_result' && b.content) {
        return b.content.map(c => c.text || '').join('');
      }
      return '';
    })
    .join('');

  console.log('Response preview:', allText.substring(0, 200));

  const jsonStart = allText.indexOf('{"articles"');
  const jsonEnd = allText.lastIndexOf('}') + 1;

  if (jsonStart === -1) throw new Error('No JSON found in response');

  const brief = JSON.parse(allText.substring(jsonStart, jsonEnd));
  if (!brief.articles || !Array.isArray(brief.articles)) throw new Error('Invalid brief structure');

  fs.writeFileSync('brief.json', JSON.stringify(brief, null, 2), 'utf-8');
  console.log(`✓ Generated ${brief.articles.length} articles`);
  brief.articles.forEach(a => console.log(`  · [${a.category}] ${a.title}`));
}

generateBrief().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
