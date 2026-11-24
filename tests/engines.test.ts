import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePerplexity } from '../src/lib/engines/perplexity';
import { parseOpenAIResponses } from '../src/lib/engines/openai-search';
import { parseGemini } from '../src/lib/engines/gemini-grounding';

test('perplexity: text, search_results and citations become deduped sources', () => {
  const out = parsePerplexity({
    choices: [{ message: { content: 'Try **Acme** or **Zento**.' } }],
    search_results: [{ title: 'Best leggings', url: 'https://www.reddit.com/r/x/1' }],
    citations: ['https://www.reddit.com/r/x/1', 'https://vogue.in/a'],
  });
  assert.equal(out.text, 'Try **Acme** or **Zento**.');
  assert.deepEqual(out.sources.map((s) => s.domain), ['reddit.com', 'vogue.in']);
  assert.equal(out.sources[0].title, 'Best leggings');
});

test('openai responses: output_text and url_citation annotations', () => {
  const out = parseOpenAIResponses({
    output: [
      { type: 'web_search_call', id: 'ws_1', status: 'completed' },
      {
        type: 'message',
        content: [
          {
            type: 'output_text',
            text: '1. Acme – soft fabric',
            annotations: [{ type: 'url_citation', url: 'https://acme.com/p?utm_source=openai', title: 'Acme' }],
          },
        ],
      },
    ],
  });
  assert.equal(out.text, '1. Acme – soft fabric');
  assert.equal(out.sources[0].url, 'https://acme.com/p');
  assert.equal(out.sources[0].domain, 'acme.com');
});

test('gemini: grounding chunks use the title as the domain', () => {
  const out = parseGemini({
    candidates: [
      {
        content: { parts: [{ text: 'Acme is popular.' }] },
        groundingMetadata: { groundingChunks: [{ web: { uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', title: 'www.Nykaa.com' } }] },
      },
    ],
  });
  assert.equal(out.text, 'Acme is popular.');
  assert.equal(out.sources[0].domain, 'nykaa.com');
});

test('parsers tolerate empty payloads', () => {
  assert.deepEqual(parsePerplexity({}), { text: '', sources: [] });
  assert.deepEqual(parseOpenAIResponses({}), { text: '', sources: [] });
  assert.deepEqual(parseGemini({}), { text: '', sources: [] });
});
