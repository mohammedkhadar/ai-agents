import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { setCors } from '../_lib/session.js';
import { getStoredToken, verifySession, publicUser } from '../_lib/session.js';

const MAX_TEXT = 20000;
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 200;
const SUPPORTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/json',
  'text/markdown',
  'application/xml',
  'text/html',
];

function chunkText(text) {
  const trimmed = text.trim();
  if (trimmed.length <= CHUNK_SIZE) return [trimmed];
  const chunks = [];
  let i = 0;
  while (i < trimmed.length) {
    let end = Math.min(i + CHUNK_SIZE, trimmed.length);
    if (i > 0 && end < trimmed.length) {
      const spaceIdx = trimmed.lastIndexOf(' ', end);
      if (spaceIdx > i) end = spaceIdx;
    }
    chunks.push(trimmed.slice(i, end));
    if (end >= trimmed.length) break;
    i = Math.max(end - CHUNK_OVERLAP, i + 1);
  }
  return chunks.filter(c => c.trim().length > 0);
}

function stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT);
}

async function parseBuffer(buffer, filename, mimeType) {
  const ext = (filename || '').split('.').pop().toLowerCase();

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (ext === 'docx' || mimeType?.includes('wordprocessingml')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.text || '';
  }

  if (ext === 'csv' || mimeType === 'text/csv') {
    return buffer.toString('utf8').slice(0, MAX_TEXT);
  }

  if (ext === 'json' || mimeType === 'application/json') {
    return buffer.toString('utf8').slice(0, MAX_TEXT);
  }

  // txt, md, xml, html, or fallback to plain text
  return buffer.toString('utf8').slice(0, MAX_TEXT);
}

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Opus Agents Knowledge Base Bot 1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const html = await res.text();
    return stripHtml(html);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  return await parseBuffer(buffer, new URL(url).pathname.split('/').pop() || 'page', contentType);
}

async function generateEmbeddings(chunks, apiKey) {
  if (!apiKey) return chunks;
  try {
    const batchSize = 100;
    const embeddings = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: batch,
          dimensions: 256,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        for (const item of data.data) {
          embeddings.push(item.embedding);
        }
      }
    }
    if (embeddings.length === chunks.length) {
      return chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));
    }
  } catch (e) {
    console.error('Embedding error:', e.message);
  }
  return chunks;
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify auth token (optional — allow if token present)
    const token = getStoredToken(req);
    let user = null;
    if (token) {
      const payload = verifySession(token);
      user = payload ? publicUser(payload) : null;
    }

    const body = req.body || {};
    const { agentId, filename, mimeType, file: base64Data, url } = body;
    if (!agentId) {
      return res.status(400).json({ message: 'agentId is required' });
    }

    let text = '';
    let source = '';
    let sourceType = 'file';

    if (url) {
      source = url;
      sourceType = 'url';
      try {
        text = await fetchUrl(url);
      } catch (e) {
        return res.status(400).json({ message: `Failed to fetch URL: ${e.message}` });
      }
    } else if (base64Data && filename) {
      source = filename;
      sourceType = SUPPORTED_TYPES.includes(mimeType) ? 'file' : 'file';
      const buffer = Buffer.from(base64Data, 'base64');
      try {
        text = await parseBuffer(buffer, filename, mimeType);
      } catch (e) {
        return res.status(400).json({ message: `Failed to parse file: ${e.message}` });
      }
    } else {
      return res.status(400).json({ message: 'Either "url" or ("file" + "filename") is required' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'No text content could be extracted' });
    }

    const rawChunks = chunkText(text);
    const chunks = rawChunks.map((text, idx) => ({
      id: `${agentId}-${Date.now()}-${idx}`,
      text,
      source,
      sourceType,
      filename: sourceType === 'file' ? filename : undefined,
      uploadedAt: new Date().toISOString(),
      userId: user?.uid || null,
    }));

    const withEmbeddings = await generateEmbeddings(chunks, process.env.OPENAI_API_KEY);

    return res.status(200).json({
      agentId,
      source,
      sourceType,
      chunkCount: chunks.length,
      textPreview: text.slice(0, 300),
      chunks: withEmbeddings,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
