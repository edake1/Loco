'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Copy,
  Heart,
  History,
  Bookmark,
  BookmarkCheck,
  ArrowRightLeft,
  Loader2,
  Check,
  X,
  RotateCcw,
  Share2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Trash2,
  UserPlus,
  UserCheck,
  Heart as HeartIcon,
  MessageCircle,
  Flame,
  Zap,
  Users,
  HeartHandshake,
  Briefcase,
  Plane,
  Laugh,
  Moon,
  Sun,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Types
interface TranslationResult {
  nativeText: string;
  transliteration?: string;
  explanation: string;
  emojiSuggestions: string[];
  culturalNotes?: string;
}

interface HistoryItem {
  id: string;
  originalText: string;
  result: TranslationResult;
  targetLanguage: string;
  targetLanguageCode: string;
  context: string;
  contextCode: string;
  vibe: string;
  vibeCode: string;
  closenessCode: string;
  mode: 'send' | 'receive';
  timestamp: number;
  isBookmarked: boolean;
}

// Constants
const MAX_CHARS = 500;

const languages = [
  { code: 'chinese', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
  { code: 'korean', name: 'Korean', flag: '🇰🇷' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'portuguese', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'german', name: 'German', flag: '🇩🇪' },
  { code: 'italian', name: 'Italian', flag: '🇮🇹' },
  { code: 'arabic', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'thai', name: 'Thai', flag: '🇹🇭' },
  { code: 'vietnamese', name: 'Vietnamese', flag: '🇻🇳' },
];

const contexts = [
  { code: 'friend', label: 'Friend', icon: Users, emoji: '👥' },
  { code: 'dating', label: 'Dating', icon: Heart, emoji: '💕' },
  { code: 'family', label: 'Family', icon: HeartHandshake, emoji: '👨‍👩‍👧' },
  { code: 'professional', label: 'Work', icon: Briefcase, emoji: '💼' },
  { code: 'traveler', label: 'Travel', icon: Plane, emoji: '✈️' },
];

const vibes = [
  { code: 'casual', label: 'Casual', icon: MessageCircle, emoji: '😊' },
  { code: 'warm', label: 'Warm', icon: Heart, emoji: '🥰' },
  { code: 'funny', label: 'Funny', icon: Laugh, emoji: '😄' },
  { code: 'flirty', label: 'Flirty', icon: Flame, emoji: '😏' },
  { code: 'slangy', label: 'Slangy', icon: Zap, emoji: '🔥' },
];

const closenessOptions = [
  { code: 'just-met', label: 'Just Met', icon: UserPlus },
  { code: 'getting-to-know', label: 'Getting to Know', icon: UserCheck },
  { code: 'close', label: 'Close', icon: HeartIcon },
];

const exampleMessages = [
  "Hey! I was thinking about you today. Hope you're doing well!",
  "Thanks for helping me out yesterday, you're the best!",
  "I saw this and thought of you 😄",
  "Happy birthday! Wishing you an amazing year ahead!",
  "Miss you! Let's catch up soon",
];

// Loading Skeleton Component
function ResultSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 animate-pulse">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="h-6 bg-orange-200/50 dark:bg-orange-800/30 rounded w-32"></div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
          <div className="h-8 bg-orange-200/50 dark:bg-orange-800/30 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-orange-200/30 dark:bg-orange-800/20 rounded w-1/2"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-orange-200/30 dark:bg-orange-800/20 rounded w-full"></div>
          <div className="h-4 bg-orange-200/30 dark:bg-orange-800/20 rounded w-4/5"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Share Card Component
function ShareCard({
  originalText,
  nativeText,
  language,
  explanation,
  onClose,
}: {
  originalText: string;
  nativeText: string;
  language: string;
  explanation: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      // Create canvas from the card
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size
      canvas.width = 600;
      canvas.height = 500;

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#fff7ed');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#fffbeb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 4;
      ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
      ctx.stroke();

      // Draw header
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('🦁 Loco', 30, 55);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Sound like a local', 30, 78);

      // Draw divider
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 100);
      ctx.lineTo(canvas.width - 30, 100);
      ctx.stroke();

      // Draw original text
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('ORIGINAL', 30, 130);

      ctx.fillStyle = '#1f2937';
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      const wrappedOriginal = wrapText(ctx, `"${originalText}"`, 30, 155, canvas.width - 60, 22);
      wrappedOriginal.forEach((line, i) => {
        ctx.fillText(line, 30, 155 + i * 22);
      });

      // Draw arrow
      ctx.fillStyle = '#ea580c';
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillText('↓', canvas.width / 2 - 10, 200 + wrappedOriginal.length * 22 + 10);

      // Draw native text
      ctx.fillStyle = '#ea580c';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`NATIVE (${language.toUpperCase()})`, 30, 240 + wrappedOriginal.length * 22);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      const wrappedNative = wrapText(ctx, nativeText, 30, 275 + wrappedOriginal.length * 22, canvas.width - 60, 34);
      wrappedNative.forEach((line, i) => {
        ctx.fillText(line, 30, 275 + wrappedOriginal.length * 22 + i * 34);
      });

      // Draw explanation
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      const wrappedExplanation = wrapText(ctx, `💡 ${explanation}`, 30, 355 + wrappedOriginal.length * 22 + wrappedNative.length * 10, canvas.width - 60, 20);
      wrappedExplanation.forEach((line, i) => {
        ctx.fillText(line, 30, 355 + wrappedOriginal.length * 22 + wrappedNative.length * 10 + i * 20);
      });

      // Draw footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('loco.app • Make your texts native', canvas.width - 230, canvas.height - 25);

      // Download
      const link = document.createElement('a');
      link.download = 'loco-translation.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [originalText, nativeText, language, explanation]);

  // Helper to wrap text
  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 3); // Max 3 lines
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Your Translation</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Preview Card */}
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-xl p-5 border-2 border-orange-200 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🦁</span>
              <div>
                <p className="font-bold text-orange-600">Loco</p>
                <p className="text-xs text-gray-400">Sound like a local</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Original</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">&quot;{originalText.slice(0, 60)}{originalText.length > 60 ? '...' : ''}&quot;</p>
              </div>

              <div className="text-center text-orange-500 text-xl">↓</div>

              <div>
                <p className="text-xs text-orange-500 uppercase tracking-wide mb-1">Native ({language})</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{nativeText}</p>
              </div>

              <p className="text-xs text-gray-500 pt-2 border-t border-orange-100">
                💡 {explanation.slice(0, 80)}{explanation.length > 80 ? '...' : ''}
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              loco.app • Make your texts native
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Image
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <CardContent className="px-4 py-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 dark:text-red-300 font-medium">Oops! Something went wrong</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{message}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3 border-red-300 text-red-600 hover:bg-red-100"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);

  // State
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedContext, setSelectedContext] = useState(contexts[0]);
  const [selectedVibe, setSelectedVibe] = useState(vibes[0]);
  const [selectedCloseness, setSelectedCloseness] = useState(closenessOptions[1]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  // Initialize dark mode from localStorage/system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('loco-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('loco-theme', newIsDark ? 'dark' : 'light');

    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('loco-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('loco-history', JSON.stringify(history));
  }, [history]);

  // Scroll to result when it appears
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [result]);

  // Handle translation
  const handleTransform = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter some text to transform',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: selectedLanguage.name,
          context: selectedContext.code,
          vibe: selectedVibe.code,
          mode,
          closeness: selectedCloseness.code,
        }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        setResult(data.result);

        // Add to history
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          originalText: inputText,
          result: data.result,
          targetLanguage: selectedLanguage.name,
          targetLanguageCode: selectedLanguage.code,
          context: selectedContext.label,
          contextCode: selectedContext.code,
          vibe: selectedVibe.label,
          vibeCode: selectedVibe.code,
          closenessCode: selectedCloseness.code,
          mode,
          timestamp: Date.now(),
          isBookmarked: false,
        };
        setHistory((prev) => [historyItem, ...prev].slice(0, 50));
      } else {
        throw new Error(data.error || 'Translation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transform your message';
      setError(errorMessage);
      toast({
        title: 'Something went wrong',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run from history
  const handleReRun = (item: HistoryItem) => {
    setInputText(item.originalText);
    const lang = languages.find((l) => l.code === item.targetLanguageCode);
    const ctx = contexts.find((c) => c.code === item.contextCode);
    const vibe = vibes.find((v) => v.code === item.vibeCode);
    const close = closenessOptions.find((c) => c.code === item.closenessCode);

    if (lang) setSelectedLanguage(lang);
    if (ctx) setSelectedContext(ctx);
    if (vibe) setSelectedVibe(vibe);
    if (close) setSelectedCloseness(close);
    setMode(item.mode);

    // Close the history drawer by setting the sheet state
    const closeButton = document.querySelector('[data-radix-collection-item]') as HTMLButtonElement;
    if (closeButton) closeButton.click();

    toast({
      title: 'Loaded from history',
      description: 'Settings restored. Click "Make It Native" to transform.',
    });
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    });
  };

  // Share transformation
  const handleShare = async () => {
    if (!result) return;

    const shareText = `🦁 Loco Translation\n\nOriginal: "${inputText}"\n\n${selectedLanguage.flag} Native: "${result.nativeText}"\n\n💡 ${result.explanation}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Loco Translation',
          text: shareText,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await handleCopy(shareText);
      toast({
        title: 'Copied for sharing!',
        description: 'Share text copied to clipboard',
      });
    }
  };

  // Clear input
  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  // Set example text
  const setExampleText = (example: string) => {
    setInputText(example);
    setShowExamples(false);
  };

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
      )
    );
    toast({
      title: 'Bookmark updated',
      description: 'Your bookmark has been saved',
    });
  };

  // Delete history item
  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    toast({
      title: 'History cleared',
      description: 'All history has been removed',
    });
  };

  const bookmarkedItems = history.filter((item) => item.isBookmarked);
  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-orange-100/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-300/40 dark:shadow-orange-900/30 ring-2 ring-white dark:ring-gray-800">
                L
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Loco
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                  Sound like a local
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                  >
                    <History className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">History</span>
                    {history.length > 0 && (
                      <Badge variant="secondary" className="sm:ml-2 ml-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                        {history.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[450px] p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-lg">History & Bookmarks</SheetTitle>
                      {history.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearHistory}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="all" className="h-full flex flex-col">
                      <div className="px-4 pt-4">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                          <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                            All ({history.length})
                          </TabsTrigger>
                          <TabsTrigger value="bookmarks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                            <Bookmark className="w-3 h-3 mr-1" />
                            Saved ({bookmarkedItems.length})
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
                        <ScrollArea className="h-[calc(100vh-200px)]">
                          <div className="p-4 pt-2">
                            {history.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No history yet</p>
                                <p className="text-sm mt-1">Your transformations will appear here</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {history.map((item) => (
                                  <div
                                    key={item.id}
                                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 hover:border-orange-200 dark:hover:border-orange-800/50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                          <Badge variant="outline" className="text-xs">
                                            {item.mode === 'send' ? '📤' : '📥'}
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                            {item.targetLanguage}
                                          </Badge>
                                          <span className="text-xs text-gray-400">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                          {item.originalText}
                                        </p>
                                        {item.result.nativeText && (
                                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1 line-clamp-1">
                                            → {item.result.nativeText}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-0.5 flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleReRun(item)}
                                          className="h-8 w-8 text-gray-400 hover:text-orange-500"
                                          title="Re-run"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => toggleBookmark(item.id)}
                                          className={`h-8 w-8 ${
                                            item.isBookmarked
                                              ? 'text-orange-500'
                                              : 'text-gray-400 hover:text-orange-500'
                                          }`}
                                        >
                                          {item.isBookmarked ? (
                                            <BookmarkCheck className="w-3.5 h-3.5" />
                                          ) : (
                                            <Bookmark className="w-3.5 h-3.5" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => deleteHistoryItem(item.id)}
                                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="bookmarks" className="flex-1 overflow-hidden mt-0">
                        <ScrollArea className="h-[calc(100vh-200px)]">
                          <div className="p-4 pt-2">
                            {bookmarkedItems.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No saved items</p>
                                <p className="text-sm mt-1">Bookmark your favorites to find them easily</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {bookmarkedItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="bg-orange-50/70 dark:bg-orange-900/10 rounded-xl p-3 border border-orange-200/50 dark:border-orange-800/30"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <Badge variant="outline" className="text-xs">
                                            {item.mode === 'send' ? '📤' : '📥'}
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            {item.targetLanguage}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                          {item.originalText}
                                        </p>
                                        {item.result.nativeText && (
                                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1 line-clamp-1">
                                            → {item.result.nativeText}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-0.5">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleCopy(item.result.nativeText)}
                                          className="h-8 w-8 text-gray-400 hover:text-orange-500"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => toggleBookmark(item.id)}
                                          className="h-8 w-8 text-orange-500"
                                        >
                                          <BookmarkCheck className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Mode Toggle */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg shadow-orange-100/30 dark:shadow-gray-900/30 border border-orange-100/50 dark:border-gray-800/50">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              onClick={() => setMode('send')}
              className={`flex-1 rounded-xl h-11 transition-all ${
                mode === 'send'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-300/30 dark:shadow-orange-900/30'
                  : 'hover:bg-orange-100/50 dark:hover:bg-orange-900/20'
              }`}
            >
              <Sparkles className="w-4 h-4 sm:mr-2" />
              <span className="hidden xs:inline">I&apos;m sending</span>
              <span className="xs:hidden">Sending</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMode('receive')}
              className={`flex-1 rounded-xl h-11 transition-all ${
                mode === 'receive'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-300/30 dark:shadow-orange-900/30'
                  : 'hover:bg-orange-100/50 dark:hover:bg-orange-900/20'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden xs:inline">They sent me</span>
              <span className="xs:hidden">Received</span>
            </Button>
          </div>
        </div>

        {/* Settings - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Language Selector */}
          <div className="col-span-2 md:col-span-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 shadow-md border border-orange-100/50 dark:border-gray-800/50">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
              Language
            </p>
            <select
              value={selectedLanguage.code}
              onChange={(e) => {
                const lang = languages.find((l) => l.code === e.target.value);
                if (lang) setSelectedLanguage(lang);
              }}
              className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Context Selector */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 shadow-md border border-orange-100/50 dark:border-gray-800/50">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
              Context
            </p>
            <div className="flex flex-wrap gap-1">
              {contexts.slice(0, 3).map((ctx) => (
                <Button
                  key={ctx.code}
                  variant={selectedContext.code === ctx.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedContext(ctx)}
                  className={`text-xs px-2 py-1 h-auto min-w-0 ${
                    selectedContext.code === ctx.code
                      ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="truncate">{ctx.emoji} <span className="hidden sm:inline">{ctx.label}</span></span>
                </Button>
              ))}
              {contexts.length > 3 && (
                <select
                  value={selectedContext.code}
                  onChange={(e) => {
                    const ctx = contexts.find((c) => c.code === e.target.value);
                    if (ctx) setSelectedContext(ctx);
                  }}
                  className="bg-gray-50 dark:bg-gray-800 border-0 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
                >
                  {contexts.slice(3).map((ctx) => (
                    <option key={ctx.code} value={ctx.code}>
                      {ctx.emoji} {ctx.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Closeness Selector */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 shadow-md border border-orange-100/50 dark:border-gray-800/50">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
              Closeness
            </p>
            <div className="flex flex-wrap gap-1">
              {closenessOptions.map((c) => (
                <Button
                  key={c.code}
                  variant={selectedCloseness.code === c.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCloseness(c)}
                  className={`text-xs px-2 py-1 h-auto ${
                    selectedCloseness.code === c.code
                      ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <c.icon className="w-3 h-3 sm:mr-1" />
                  <span className="hidden sm:inline">{c.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Vibe Selector */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 shadow-md border border-orange-100/50 dark:border-gray-800/50">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
              Vibe
            </p>
            <div className="flex flex-wrap gap-1">
              {vibes.slice(0, 3).map((vibe) => (
                <Button
                  key={vibe.code}
                  variant={selectedVibe.code === vibe.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedVibe(vibe)}
                  className={`text-xs px-2 py-1 h-auto min-w-0 ${
                    selectedVibe.code === vibe.code
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="truncate">{vibe.emoji}</span>
                </Button>
              ))}
              {vibes.length > 3 && (
                <select
                  value={selectedVibe.code}
                  onChange={(e) => {
                    const vibe = vibes.find((v) => v.code === e.target.value);
                    if (vibe) setSelectedVibe(vibe);
                  }}
                  className="bg-gray-50 dark:bg-gray-800 border-0 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
                >
                  {vibes.slice(3).map((vibe) => (
                    <option key={vibe.code} value={vibe.code}>
                      {vibe.emoji} {vibe.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100/50 dark:border-gray-800/50 overflow-hidden">
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {mode === 'send' ? 'Your message' : 'What they sent'}
              </h2>
              <div className="flex items-center gap-2">
                {inputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-7 text-xs text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
                <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 space-y-3">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS + 50))}
              placeholder={
                mode === 'send'
                  ? "Type what you want to say..."
                  : 'Paste their message here...'
              }
              className="min-h-[100px] resize-none border-0 bg-gray-50 dark:bg-gray-800/50 focus:ring-orange-500 text-base"
            />

            {/* Example Messages */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
                className="text-orange-600 dark:text-orange-400 text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Examples
                {showExamples ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </Button>
            </div>

            {showExamples && (
              <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                {exampleMessages.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setExampleText(example)}
                    className="text-xs bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                  >
                    &quot;{example.slice(0, 30)}...&quot;
                  </Button>
                ))}
              </div>
            )}

            <Button
              onClick={handleTransform}
              disabled={isLoading || !inputText.trim() || isOverLimit}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 text-white h-12 text-base font-medium shadow-lg shadow-orange-300/30 dark:shadow-orange-900/30 rounded-xl transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Transforming...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {mode === 'send' ? 'Make It Native' : 'Explain It'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Result Section */}
        {isLoading && <ResultSkeleton />}

        {error && !isLoading && (
          <ErrorState message={error} onRetry={handleTransform} />
        )}

        {result && !isLoading && !error && (
          <div ref={resultRef} className="animate-in slide-in-from-bottom-4 duration-300">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <CheckCircle2 className="w-5 h-5" />
                    {mode === 'send' ? 'Native Version' : 'What It Means'}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowShareCard(true)}
                      className="text-orange-600 dark:text-orange-400"
                      title="Generate share card"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="text-orange-600 dark:text-orange-400"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {result.nativeText && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.nativeText)}
                        className="text-orange-600 dark:text-orange-400"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {/* Native Text */}
                {result.nativeText && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-orange-100 dark:border-gray-700">
                    <p className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed">
                      {result.nativeText}
                    </p>
                    {result.transliteration && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                        {result.transliteration}
                      </p>
                    )}
                  </div>
                )}

                {/* Emoji Suggestions */}
                {result.emojiSuggestions && result.emojiSuggestions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Add some flavor:
                    </span>
                    <div className="flex gap-1">
                      {result.emojiSuggestions.map((emoji, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(emoji)}
                          className="text-2xl h-auto py-1 px-2 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 border border-orange-100/50 dark:border-gray-700/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    💡 {result.explanation}
                  </p>
                </div>

                {/* Cultural Notes */}
                {result.culturalNotes && (
                  <div className="bg-amber-100/70 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      🌍 <strong>Cultural note:</strong> {result.culturalNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Share Card Modal */}
      {showShareCard && result && (
        <ShareCard
          originalText={inputText}
          nativeText={result.nativeText}
          language={selectedLanguage.name}
          explanation={result.explanation}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Made with 🧡 by Loco • Connect deeper with friends
        </p>
      </footer>
    </div>
  );
}
