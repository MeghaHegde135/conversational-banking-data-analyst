import { Router, Request, Response } from 'express';
import { AskQuestionSchema } from '../validators';
import { ClassificationService } from '../services/classification.service';
import { DatasetService } from '../services/dataset.service';
import { QueryRegistryService } from '../services/queryRegistry.service';
import { AnalyticsExecutionService } from '../services/execution.service';
import { ResponseFormattingService } from '../services/formatting.service';

const router = Router();

const classificationService = new ClassificationService();
const datasetService = new DatasetService();
const queryRegistryService = new QueryRegistryService();
const executionService = new AnalyticsExecutionService();
const formattingService = new ResponseFormattingService();

const SUPPORTED_QUESTIONS_GUIDE = [
  { intent: 'customer_count', example: 'How many customers do we have?' },
  { intent: 'pending_applications', example: 'Show pending onboarding applications' },
  { intent: 'application_status', example: 'Show applications by status' },
  { intent: 'branch_customers', example: 'Which branches have the most customers?' },
  { intent: 'total_transactions', example: 'What is the total transaction amount?' },
  { intent: 'monthly_transactions', example: 'Show monthly transaction trends' },
];

/**
 * POST /api/analytics/ask
 * Natural language conversational banking data analytics endpoint.
 */
router.post('/ask', (req: Request, res: Response): void => {
  // 1. Zod Request Validation (HTTP 400 on failure)
  const validationResult = AskQuestionSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map((i) => i.message).join('; ');
    res.status(400).json({
      success: false,
      error: errorMessages,
      details: validationResult.error.issues,
    });
    return;
  }

  const { question } = validationResult.data;

  try {
    // 2. Question Classification Service (Mocked AI intent classification)
    const classification = classificationService.classifyQuestion(question);

    // HTTP 422 for unsupported questions
    if (!classification) {
      console.warn(`[Analytics 422] Unsupported Question received: "${question.substring(0, 80)}"`);
      res.status(422).json({
        success: false,
        question,
        error: 'Unsupported question. Could not map question to an approved banking analytics query.',
        supported_intents: SUPPORTED_QUESTIONS_GUIDE,
      });
      return;
    }

    // 3. Dataset Identification Service
    const dataset = datasetService.getDatasetForIntent(classification.intent);

    // 4. Approved Query Registry (Reviewed, parameterized SQL only - Never raw AI SQL)
    const queryDef = queryRegistryService.getApprovedQuery(classification.intent);

    // 5. Analytics Execution Service (Enforces bounds and parameters)
    const rawData = executionService.executeQuery(queryDef);

    // 6. Response Formatting Service (Natural language answer + visualization metadata)
    const responsePayload = formattingService.formatResponse(
      question,
      classification.intent,
      dataset,
      queryDef.visualization,
      rawData
    );

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[Analytics 500 Error]', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the analytics question.',
    });
  }
});

export default router;
