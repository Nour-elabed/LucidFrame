import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, User, Package, UserCheck, Share2, Download } from 'lucide-react';
import { aiService, type GenerationType } from '../services/ai.service';
import { postsService } from '../services/posts.service';
import type { GeneratedImage } from '../types';
import { getApiOrigin } from '../lib/apiOrigin';

const API_BASE = getApiOrigin();

const types: { value: GenerationType; label: string; icon: any; desc: string }[] = [
  { value: 'person', label: 'Person', icon: User, desc: 'Portrait or lifestyle photo of a person' },
  { value: 'product', label: 'Product', icon: Package, desc: 'Studio product photography' },
  { value: 'person_with_product', label: 'Person + Product', icon: UserCheck, desc: 'Person holding or using a product' },
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<GenerationType>('person');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [shared, setShared] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setShared(false);
    try {
      const generated = await aiService.generate(prompt.trim(), type, type === 'person_with_product' ? imageFile : null);
      setLastPrompt(prompt.trim());
      setResult(generated);
      setPrompt('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Generation failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    setSharing(true);
    try {
await postsService.createPost(result.imageUrl, '');setShared(true);
    } catch {
      setError('Failed to share post.');
    } finally {
      setSharing(false);
    }
  };
  const handleDownload = async () => {
    if (!result) return;

    const imageUrl = result.imageUrl?.startsWith('http')
      ? result.imageUrl
      : `${API_BASE}${result.imageUrl}`;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = `lucidframe-${Date.now()}.jpg`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download image.');
    }
  };

  const examplePrompts = [
    'person holding a luxury handbag in a city street',
    'product photography of premium sneakers on marble',
    'portrait of a confident businesswoman in office',
    'person with wireless headphones in a coffee shop',
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-4">
            <Sparkles className="w-3 h-3" /> Powered by Gemini AI
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            Generate <span className="gold-text">Images</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Describe your vision and let AI bring it to life
          </p>
        </motion.div>

        {/* Type Selector */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-6">
          {types.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`glass border rounded-2xl p-4 text-left transition-all duration-200 ${
                type === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border/40 hover:border-border/70'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${type === value ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className={`text-sm font-medium ${type === value ? 'text-primary' : 'text-foreground'}`}>{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</div>
            </button>
          ))}
        </motion.div>

        {/* Prompt Form */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass border border-border/40 rounded-2xl p-6 mb-6">
          <form onSubmit={handleGenerate}>
            <label className="block text-sm font-medium text-foreground mb-2">Describe your image</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder={
                type === 'person' ? 'e.g. portrait of a confident businesswoman in office...' :
                type === 'product' ? 'e.g. premium sneakers on marble...' :
                'e.g. person with wireless headphones in a coffee shop...'
              }
              className="w-full bg-secondary/50 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none mb-3"
            />

            {type === 'person_with_product' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Product Image (Reference)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                />
              </div>
            )}

            {/* Example prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {examplePrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-xs bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors border border-border/30"
                >
                  {p.length > 35 ? p.slice(0, 35) + '…' : p}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Image
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass border border-border/40 rounded-2xl overflow-hidden premium-shadow"
            >
              <img
                src={result.imageUrl?.startsWith('http') ? result.imageUrl : `${API_BASE}${result.imageUrl}`}
                alt={result.prompt}
                className="w-full object-cover max-h-[500px]"
              />
              <div className="p-5">
                <p className="text-sm text-foreground mb-4">{result.prompt}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    disabled={shared || sharing}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      shared
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    } disabled:opacity-60`}
                  >
                    <Share2 className="w-4 h-4" />
                    {shared ? 'Shared to Feed!' : sharing ? 'Sharing…' : 'Share to Feed'}
                  </button>
                     <button
                    onClick={handleDownload}
                    className="px-4 py-2.5 rounded-xl border flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}