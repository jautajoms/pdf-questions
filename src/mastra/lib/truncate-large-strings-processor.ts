import type { AISpanProcessor, AnyAISpan } from '@mastra/core/ai-tracing';

/**
 * Processor that truncates large string values in span inputs and outputs
 * to prevent JSON serialization errors when exporting traces.
 */
export class TruncateLargeStringsProcessor implements AISpanProcessor {
  name = 'truncate-large-strings-processor';
  private readonly maxStringLength: number;

  constructor(maxStringLength: number = 50000) {
    this.maxStringLength = maxStringLength;
  }

  process(span: AnyAISpan): AnyAISpan {
    // Truncate input if it's a string and too long
    if (typeof span.input === 'string' && span.input.length > this.maxStringLength) {
      span.input = span.input.substring(0, this.maxStringLength) + `... [truncated ${span.input.length - this.maxStringLength} characters]`;
    }

    // Truncate output if it's a string and too long
    if (typeof span.output === 'string' && span.output.length > this.maxStringLength) {
      span.output = span.output.substring(0, this.maxStringLength) + `... [truncated ${span.output.length - this.maxStringLength} characters]`;
    }

    // Truncate large strings in metadata
    if (span.metadata && typeof span.metadata === 'object') {
      span.metadata = this.truncateObjectStrings(span.metadata);
    }

    return span;
  }

  private truncateObjectStrings(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.truncateObjectStrings(item));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.length > this.maxStringLength) {
        result[key] = value.substring(0, this.maxStringLength) + `... [truncated ${value.length - this.maxStringLength} characters]`;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.truncateObjectStrings(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  async shutdown(): Promise<void> {
    // No cleanup needed
  }
}
