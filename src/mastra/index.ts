import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { SensitiveDataFilter } from '@mastra/core/ai-tracing';
import { pdfToQuestionsWorkflow } from './workflows/generate-questions-from-pdf-workflow';
import { textQuestionAgent } from './agents/text-question-agent';
import { pdfQuestionAgent } from './agents/pdf-question-agent';
import { pdfSummarizationAgent } from './agents/pdf-summarization-agent';
import { TruncateLargeStringsProcessor } from './lib/truncate-large-strings-processor';

export const mastra = new Mastra({
  workflows: { pdfToQuestionsWorkflow },
  agents: {
    textQuestionAgent,
    pdfQuestionAgent,
    pdfSummarizationAgent,
  },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    // stores observability, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: {
    configs: {
      default: {
        serviceName: 'mastra',
        sampling: { type: 'always' },
        processors: [
          new TruncateLargeStringsProcessor(50000), // Truncate strings longer than 50KB
          new SensitiveDataFilter(),
        ],
      },
    },
  },
});
