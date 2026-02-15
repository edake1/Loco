'use client';

import { useState, useEffect } from 'react';
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
  Languages,
  Users,
  MessageCircle,
  Plane,
  Briefcase,
  HeartHandshake,
  Laugh,
  Flame,
  Zap,
  UserPlus,
  UserCheck,
  Heart as HeartIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  context: string;
  vibe: string;
  mode: 'send' | 'receive';
  timestamp: number;
  isBookmarked: boolean;
}

// Language options
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

// Context options
const contexts = [
  { code: 'friend', label: 'Friend', icon: Users, emoji: '👥' },
  { code: 'dating', label: 'Dating', icon: Heart, emoji: '💕' },
  { code: 'family', label: 'Family', icon: HeartHandshake, emoji: '👨‍👩‍👧' },
  { code: 'professional', label: 'Professional', icon: Briefcase, emoji: '💼' },
  { code: 'traveler', label: 'Traveler', icon: Plane, emoji: '✈️' },
];

// Vibe options
const vibes = [
  { code: 'casual', label: 'Casual', icon: MessageCircle, emoji: '😊' },
  { code: 'warm', label: 'Warm', icon: Heart, emoji: '🥰' },
  { code: 'funny', label: 'Funny', icon: Laugh, emoji: '😄' },
  { code: 'flirty', label: 'Flirty', icon: Flame, emoji: '😏' },
  { code: 'slangy', label: 'Slangy', icon: Zap, emoji: '🔥' },
];

// Closeness options
const closenessOptions = [
  { code: 'just-met', label: 'Just Met', icon: UserPlus },
  { code: 'getting-to-know', label: 'Getting to Know', icon: UserCheck },
  { code: 'close', label: 'Close', icon: HeartIcon },
];

export default function Home() {
  const { toast } = useToast();

  // State
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedContext, setSelectedContext] = useState(contexts[0]);
  const [selectedVibe, setSelectedVibe] = useState(vibes[0]);
  const [selectedCloseness, setSelectedCloseness] = useState(closenessOptions[1]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

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
          context: selectedContext.label,
          vibe: selectedVibe.label,
          mode,
          timestamp: Date.now(),
          isBookmarked: false,
        };
        setHistory((prev) => [historyItem, ...prev].slice(0, 50)); // Keep last 50
      } else {
        throw new Error(data.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Something went wrong',
        description: 'Failed to transform your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

  // Get bookmarked items
  const bookmarkedItems = history.filter((item) => item.isBookmarked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-orange-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                L
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Loco
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sound like a local
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-600 dark:text-gray-300"
            >
              <History className="w-4 h-4 mr-2" />
              History
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {history.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Mode Toggle */}
        <Card className="border-0 shadow-lg shadow-orange-100/50 dark:shadow-gray-900/50 bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={mode === 'send' ? 'default' : 'outline'}
                onClick={() => setMode('send')}
                className={`flex-1 ${
                  mode === 'send'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                    : ''
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                I&apos;m sending
              </Button>
              <Button
                variant={mode === 'receive' ? 'default' : 'outline'}
                onClick={() => setMode('receive')}
                className={`flex-1 ${
                  mode === 'receive'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                    : ''
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                They sent me
              </Button>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              {mode === 'send'
                ? 'Transform your message to sound native'
                : 'Understand what they really mean'}
            </p>
          </CardContent>
        </Card>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Language Selector */}
          <Card className="border-0 shadow-md bg-white dark:bg-gray-900">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardDescription className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400">
                Language
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <select
                value={selectedLanguage.code}
                onChange={(e) => {
                  const lang = languages.find((l) => l.code === e.target.value);
                  if (lang) setSelectedLanguage(lang);
                }}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Context Selector */}
          <Card className="border-0 shadow-md bg-white dark:bg-gray-900">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardDescription className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400">
                Context
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {contexts.map((ctx) => (
                  <Button
                    key={ctx.code}
                    variant={selectedContext.code === ctx.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedContext(ctx)}
                    className={`text-xs px-2.5 py-1 h-auto ${
                      selectedContext.code === ctx.code
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : ''
                    }`}
                  >
                    {ctx.emoji} {ctx.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Closeness Selector */}
          <Card className="border-0 shadow-md bg-white dark:bg-gray-900">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardDescription className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400">
                How close?
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {closenessOptions.map((c) => (
                  <Button
                    key={c.code}
                    variant={selectedCloseness.code === c.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCloseness(c)}
                    className={`text-xs px-2.5 py-1 h-auto ${
                      selectedCloseness.code === c.code
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : ''
                    }`}
                  >
                    <c.icon className="w-3 h-3 mr-1" />
                    {c.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vibe Selector */}
        <Card className="border-0 shadow-md bg-white dark:bg-gray-900">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400">
              Vibe
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {vibes.map((vibe) => (
                <Button
                  key={vibe.code}
                  variant={selectedVibe.code === vibe.code ? 'default' : 'outline'}
                  onClick={() => setSelectedVibe(vibe)}
                  className={`${
                    selectedVibe.code === vibe.code
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                      : ''
                  }`}
                >
                  {vibe.emoji} {vibe.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="border-0 shadow-lg shadow-orange-100/50 dark:shadow-gray-900/50 bg-white dark:bg-gray-900">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-lg">
              {mode === 'send' ? 'Your message' : 'What they sent'}
            </CardTitle>
            <CardDescription>
              {mode === 'send'
                ? 'Type your message in English and we\'ll make it sound native'
                : 'Paste their message and we\'ll explain what it really means'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'send'
                  ? "Hey! I was thinking about you today. Hope you're doing well!"
                  : 'Paste their message here...'
              }
              className="min-h-[120px] resize-none border-gray-200 dark:border-gray-700 focus:ring-orange-500"
            />
            <Button
              onClick={handleTransform}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-12 text-base font-medium shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
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
          </CardContent>
        </Card>

        {/* Result Section */}
        {result && (
          <Card className="border-0 shadow-lg shadow-orange-200/50 dark:shadow-gray-900/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-orange-700 dark:text-orange-300">
                  {mode === 'send' ? 'Native Version' : 'What It Means'}
                </CardTitle>
                {result.nativeText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.nativeText)}
                    className="text-orange-600 dark:text-orange-400"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {/* Native Text */}
              {result.nativeText && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-orange-100 dark:border-gray-700">
                  <p className="text-2xl font-medium text-gray-900 dark:text-white leading-relaxed">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Try these emojis:
                  </span>
                  <div className="flex gap-1">
                    {result.emojiSuggestions.map((emoji, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(emoji)}
                        className="text-2xl h-auto py-1 px-2"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  💡 {result.explanation}
                </p>
              </div>

              {/* Cultural Notes */}
              {result.culturalNotes && (
                <div className="bg-amber-100/50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    🌍 <strong>Cultural note:</strong> {result.culturalNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* History Panel */}
        {showHistory && (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">History & Bookmarks</CardTitle>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="all">
                    All ({history.length})
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks">
                    <Bookmark className="w-3 h-3 mr-1" />
                    Saved ({bookmarkedItems.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <ScrollArea className="h-[400px]">
                    {history.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No history yet</p>
                        <p className="text-sm">Your transformations will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.mode === 'send' ? '📤 Sent' : '📥 Received'}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.targetLanguage}
                                  </Badge>
                                  <span className="text-xs text-gray-400">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                  {item.originalText}
                                </p>
                                {item.result.nativeText && (
                                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">
                                    → {item.result.nativeText}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleBookmark(item.id)}
                                  className={
                                    item.isBookmarked
                                      ? 'text-orange-500'
                                      : 'text-gray-400'
                                  }
                                >
                                  {item.isBookmarked ? (
                                    <BookmarkCheck className="w-4 h-4" />
                                  ) : (
                                    <Bookmark className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteHistoryItem(item.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="bookmarks">
                  <ScrollArea className="h-[400px]">
                    {bookmarkedItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No saved items yet</p>
                        <p className="text-sm">Bookmark your favorites to find them easily</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookmarkedItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-100 dark:border-orange-800"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.mode === 'send' ? '📤 Sent' : '📥 Received'}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.targetLanguage}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                  {item.originalText}
                                </p>
                                {item.result.nativeText && (
                                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">
                                    → {item.result.nativeText}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy(item.result.nativeText)}
                                  className="text-gray-400"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleBookmark(item.id)}
                                  className="text-orange-500"
                                >
                                  <BookmarkCheck className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Made with 🧡 by Loco • Connect deeper with friends
        </p>
      </footer>
    </div>
  );
}
