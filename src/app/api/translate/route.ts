import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  context: 'friend' | 'dating' | 'family' | 'professional' | 'traveler';
  vibe: 'casual' | 'warm' | 'funny' | 'flirty' | 'slangy';
  mode: 'send' | 'receive';
  closeness: 'just-met' | 'getting-to-know' | 'close';
}

interface TranslationResult {
  nativeText: string;
  transliteration?: string;
  explanation: string;
  emojiSuggestions: string[];
  culturalNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, targetLanguage, context, vibe, mode, closeness } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build the system prompt based on mode
    const systemPrompt = buildSystemPrompt(targetLanguage, context, vibe, mode, closeness);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: buildUserPrompt(text, mode, targetLanguage),
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    // Parse the AI response
    const result = parseAIResponse(responseContent, mode);

    return NextResponse.json({
      success: true,
      result,
      originalText: text,
      targetLanguage,
      context,
      vibe,
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to process translation. Please try again.' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  language: string,
  context: string,
  vibe: string,
  mode: string,
  closeness: string
): string {
  const contextDescriptions: Record<string, string> = {
    friend: 'texting a friend',
    dating: 'texting someone they are dating or interested in romantically',
    family: 'texting a family member',
    professional: 'texting a colleague or business contact',
    traveler: 'texting a local while traveling',
  };

  const vibeDescriptions: Record<string, string> = {
    casual: 'relaxed and informal, like everyday conversation',
    warm: 'affectionate and caring, showing emotional connection',
    funny: 'playful and humorous, with jokes or witty remarks',
    flirty: 'charming and slightly romantic, but not over the top',
    slangy: 'heavy use of slang and Gen Z style expressions',
  };

  const closenessDescriptions: Record<string, string> = {
    'just-met': 'they just met recently, so be friendly but not overly familiar',
    'getting-to-know': 'they are getting to know each other, warm but appropriate',
    'close': 'they are close friends/partners, so be very warm and familiar',
  };

  if (mode === 'send') {
    return `You are a native ${language} speaker helping someone sound like a local when texting.

CONTEXT: The user is ${contextDescriptions[context]}. They are ${closenessDescriptions[closeness]}.
VIBE: ${vibeDescriptions[vibe]}

Your job is to translate their message to sound:
1. Native and natural - like a local would actually say it
2. Culturally appropriate for the context
3. Match the requested vibe exactly
4. Use appropriate slang, idioms, or colloquialisms when fitting

IMPORTANT RULES:
- DO NOT give formal, textbook translations
- DO use expressions locals actually say
- DO consider the relationship context
- DO match the emotional tone

Respond in this exact JSON format:
{
  "nativeText": "the translation in ${language}",
  "transliteration": "pronunciation guide if using non-Latin script",
  "explanation": "brief explanation of why this sounds native (1-2 sentences)",
  "emojiSuggestions": ["emoji1", "emoji2", "emoji3"],
  "culturalNotes": "any cultural context the user should know (optional)"
}

Give 3 variations if appropriate, but prioritize the BEST one.`;
  } else {
    return `You are a cultural interpreter helping someone understand what their ${language}-speaking friend really means.

CONTEXT: The user is ${contextDescriptions[context]}. They are ${closenessDescriptions[closeness]}.

Your job is to:
1. Translate the message accurately but focus on the SOCIAL meaning
2. Explain any slang, idioms, or cultural references
3. Tell them what the tone/emotion really is
4. Give context on how a native would interpret this

Respond in this exact JSON format:
{
  "nativeText": "the original text for reference",
  "transliteration": "pronunciation if helpful",
  "explanation": "the translation and what it really means socially",
  "emojiSuggestions": ["emojis that capture the vibe"],
  "culturalNotes": "important cultural context or what the sender might really be implying"
}

Be helpful and give social insights, not just word-for-word translation.`;
  }
}

function buildUserPrompt(text: string, mode: string, language: string): string {
  if (mode === 'send') {
    return `Transform this message to sound like a native ${language} speaker would say it naturally:

"${text}"

Make it sound authentic, warm, and like something a local would actually text.`;
  } else {
    return `Explain what this ${language} message really means and the social context:

"${text}"

What are they really saying? What's the tone? Any cultural nuances I should know?`;
  }
}

function parseAIResponse(content: string, mode: string): TranslationResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        nativeText: parsed.nativeText || '',
        transliteration: parsed.transliteration,
        explanation: parsed.explanation || '',
        emojiSuggestions: parsed.emojiSuggestions || [],
        culturalNotes: parsed.culturalNotes,
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e);
  }

  // Fallback: use the raw content as explanation
  return {
    nativeText: '',
    explanation: content,
    emojiSuggestions: [],
  };
}
