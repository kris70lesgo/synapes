import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://synapes.app',
    'X-Title': 'Synapes Playbook Extractor',
  },
});

export interface ExtractedPlaybook {
  task_name: string;
  steps: Array<{
    step: number;
    action: string;
    description: string;
  }>;
  common_failures: Array<{
    issue: string;
    fix: string;
  }>;
}

export async function extractPlaybook(content: string): Promise<ExtractedPlaybook> {
  const prompt = `Extract a structured playbook from this text. Return ONLY valid JSON:
{
  "task_name": "Short title",
  "steps": [{"step": 1, "action": "command", "description": "what it does"}],
  "common_failures": [{"issue": "problem", "fix": "solution"}]
}

Text:
${content}`;

  const response = await openai.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content_str = response.choices[0].message.content;
  if (!content_str) {
    throw new Error('No content received from OpenAI');
  }

  return JSON.parse(content_str) as ExtractedPlaybook;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    input: text,
    model: 'openai/text-embedding-3-small',
  });

  return response.data[0].embedding;
}

export async function embedPlaybook(playbook: ExtractedPlaybook): Promise<number[]> {
  const textToEmbed = 
    playbook.task_name + ' ' + 
    playbook.steps.map(s => s.action).join(' ');
  
  return generateEmbedding(textToEmbed);
}
