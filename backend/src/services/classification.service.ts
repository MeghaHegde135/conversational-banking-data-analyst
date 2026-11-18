import { ClassificationResult, SupportedIntent } from '../types';

interface IntentPattern {
  intent: SupportedIntent;
  patterns: RegExp[];
  keywords: string[];
}

export class ClassificationService {
  private static readonly INTENT_RULES: IntentPattern[] = [
    {
      intent: 'customer_count',
      patterns: [
        /how\s+many\s+customers/i,
        /count\s+(?:of\s+)?customers/i,
        /total\s+(?:number\s+of\s+)?customers/i,
        /number\s+of\s+(?:registered\s+)?customers/i,
        /customer\s+count/i,
        /customers\s+do\s+we\s+have/i,
      ],
      keywords: ['how many', 'customers', 'count', 'total customers', 'client count'],
    },
    {
      intent: 'pending_applications',
      patterns: [
        /show\s+(?:all\s+)?pending\s+(?:onboarding\s+)?applications/i,
        /pending\s+(?:onboarding\s+)?applications/i,
        /(?:which\s+)?applications\s+(?:that\s+are\s+|are\s+)?pending/i,
        /list\s+(?:all\s+)?pending/i,
        /who\s+is\s+pending\s+onboarding/i,
        /pending\s+files/i,
        /pending\s+onboarding/i,
      ],
      keywords: ['pending', 'onboarding applications', 'pending applications', 'awaiting approval'],
    },
    {
      intent: 'application_status',
      patterns: [
        /(?:show|list|get)\s+applications\s+by\s+status/i,
        /application\s+status\s+(?:breakdown|distribution|summary)/i,
        /status\s+of\s+(?:onboarding\s+)?applications/i,
        /applications\s+by\s+status/i,
        /how\s+many\s+(?:applications\s+are\s+)?(?:approved|rejected|pending)/i,
        /applications\s+(?:approved|rejected|pending)/i,
      ],
      keywords: ['status', 'applications by status', 'breakdown', 'approved', 'rejected'],
    },
    {
      intent: 'branch_customers',
      patterns: [
        /which\s+branches\s+have\s+the\s+most\s+customers/i,
        /branches\s+with\s+(?:the\s+)?most\s+customers/i,
        /customers\s+by\s+branch/i,
        /customers\s+per\s+branch/i,
        /branch\s+customer\s+(?:count|distribution)/i,
        /top\s+branches/i,
      ],
      keywords: ['branches', 'most customers', 'by branch', 'customers per branch', 'branch customers'],
    },
    {
      intent: 'total_transactions',
      patterns: [
        /what\s+is\s+the\s+total\s+transaction\s+amount/i,
        /total\s+transaction\s+(?:amount|volume|value)/i,
        /sum\s+of\s+(?:all\s+)?transactions/i,
        /overall\s+transactions\s+amount/i,
        /total\s+amount\s+transacted/i,
      ],
      keywords: ['total transaction', 'transaction amount', 'total volume', 'sum transactions'],
    },
    {
      intent: 'monthly_transactions',
      patterns: [
        /show\s+monthly\s+transaction\s+trends/i,
        /monthly\s+transaction\s+(?:trends|trend|history|volumes|volume)/i,
        /transactions\s+by\s+month/i,
        /transactions\s+across\s+(?:multiple\s+)?months/i,
        /month\s+over\s+month\s+transactions/i,
      ],
      keywords: ['monthly', 'transaction trends', 'by month', 'monthly transactions', 'trends'],
    },
  ];

  /**
   * Classify user natural language question into one of the supported intents.
   * Simulates AI semantic intent classification with strict confidence scoring.
   */
  public classifyQuestion(question: string): ClassificationResult | null {
    const cleaned = question.trim().toLowerCase().replace(/[?!.,]/g, '');

    let bestMatch: ClassificationResult | null = null;
    let highestScore = 0;

    for (const rule of ClassificationService.INTENT_RULES) {
      // 1. Direct Regex Pattern Matching (High confidence)
      for (const pattern of rule.patterns) {
        if (pattern.test(cleaned)) {
          return {
            intent: rule.intent,
            confidence: 0.98,
          };
        }
      }

      // 2. Keyword Density & Semantic Scoring
      let score = 0;
      for (const kw of rule.keywords) {
        if (cleaned.includes(kw.toLowerCase())) {
          score += 0.35;
        }
      }

      if (score > highestScore && score >= 0.6) {
        highestScore = score;
        bestMatch = {
          intent: rule.intent,
          confidence: Math.min(score, 0.95),
        };
      }
    }

    return bestMatch;
  }
}
