import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '../hooks/useToast';

export interface KnowledgeChunk {
  id: string;
  text: string;
  source: string;
  sourceType: 'file' | 'url';
  filename?: string;
  uploadedAt: string;
  userId: string | null;
  embedding?: number[];
}

export interface KnowledgeBase {
  id: string;
  agentId: string;
  source: string;
  sourceType: 'file' | 'url';
  filename?: string;
  chunkCount: number;
  textPreview: string;
  uploadedAt: string;
  chunks: KnowledgeChunk[];
}

interface KnowledgeUploaderProps {
  agentId: string;
  existing?: KnowledgeBase[];
  onChange: (knowledgeBases: KnowledgeBase[]) => void;
}

const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/json',
  'text/markdown',
];

const KnowledgeUploader: React.FC<KnowledgeUploaderProps> = ({ agentId, existing = [], onChange }) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(existing);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const updateKB = useCallback((updated: KnowledgeBase[]) => {
    setKnowledgeBases(updated);
    onChange(updated);
  }, [onChange]);

  const uploadFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isSupported = SUPPORTED_FILE_TYPES.includes(file.type) ||
      ['pdf', 'docx', 'txt', 'csv', 'json', 'md'].includes(ext || '');
    if (!isSupported) {
      showToast('Unsupported file type', `Please upload PDF, DOCX, TXT, CSV, JSON, or Markdown files.`, 'error');
      return;
    }

    // Check file size (max 3MB for base64-safe Vercel limit)
    if (file.size > 3 * 1024 * 1024) {
      showToast('File too large', 'Maximum file size is 3MB.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Processing ${file.name}...`);

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          filename: file.name,
          mimeType: file.type,
          file: base64,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const newKB: KnowledgeBase = {
          id: `${agentId}-kb-${Date.now()}`,
          agentId,
          source: data.source,
          sourceType: data.sourceType,
          filename: file.name,
          chunkCount: data.chunkCount,
          textPreview: data.textPreview,
          uploadedAt: new Date().toISOString(),
          chunks: data.chunks,
        };
        updateKB([newKB, ...knowledgeBases]);
        setUploadProgress('');
        showToast('Upload complete', `${file.name} processed into ${data.chunkCount} chunks.`, 'success');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      showToast('Upload error', msg, 'error');
      setUploadProgress('');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadUrl = async (url: string) => {
    if (!url.trim()) return;

    let validUrl: string;
    try {
      validUrl = new URL(url).toString();
    } catch {
      showToast('Invalid URL', 'Please enter a valid website URL (e.g., https://example.com).', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Fetching ${url}...`);

    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          url: validUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const newKB: KnowledgeBase = {
          id: `${agentId}-kb-${Date.now()}`,
          agentId,
          source: data.source,
          sourceType: data.sourceType,
          chunkCount: data.chunkCount,
          textPreview: data.textPreview,
          uploadedAt: new Date().toISOString(),
          chunks: data.chunks,
        };
        updateKB([newKB, ...knowledgeBases]);
        setUploadProgress('');
        showToast('Website indexed', `Fetched ${data.chunkCount} chunks from ${url}.`, 'success');
      } else {
        throw new Error(data.message || 'Fetch failed');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      showToast('Fetch error', msg, 'error');
      setUploadProgress('');
    } finally {
      setIsUploading(false);
    }
  };

  const removeKB = (id: string) => {
    updateKB(knowledgeBases.filter(kb => kb.id !== id));
  };

  const formatSource = (kb: KnowledgeBase) => {
    if (kb.sourceType === 'url') {
      try {
        return new URL(kb.source).hostname;
      } catch {
        return kb.source;
      }
    }
    return kb.filename || kb.source;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V8a4 4 0 018 0v8m-4 4h.01M11 4h2a2 2 0 110 4h-2a2 2 0 110-4z" />
            </svg>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              Upload a document to train the agent
            </label>
            <p className="text-xs text-gray-500 mt-0.5">
              PDF, DOCX, TXT, CSV, JSON, or Markdown (max 3MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv,.json,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/json,text/markdown"
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
            disabled={isUploading || !agentId}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !agentId}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Choose File
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              uploadUrl(urlInput);
            }}
            className="flex gap-2"
          >
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/knowledge-base"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isUploading}
            />
            <button
              type="submit"
              disabled={isUploading || !urlInput.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Index
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-1.5">
            Enter your business website to scrape and index its content
          </p>
        </div>
      </div>

      {isUploading && uploadProgress && (
        <div className="text-sm text-gray-500 animate-pulse">{uploadProgress}</div>
      )}

      {/* Knowledge Base List */}
      {knowledgeBases.length > 0 && (
        <div className="space-y-3">
          {knowledgeBases.map((kb) => (
            <div key={kb.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {kb.sourceType === 'url' ? '🔗' : '📄'}
                    </span>
                    <span className="font-medium text-gray-900 truncate">
                      {formatSource(kb)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {kb.chunkCount} chunks · Uploaded at {formatTime(kb.uploadedAt)}
                  </p>
                  {kb.textPreview && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {kb.textPreview.slice(0, 80)}...
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeKB(kb.id)}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {knowledgeBases.length === 0 && !isUploading && (
        <p className="text-sm text-gray-400 text-center py-4">
          No knowledge sources added. Upload documents or add website URLs to make your agent smarter.
        </p>
      )}
    </div>
  );
};

export default KnowledgeUploader;
