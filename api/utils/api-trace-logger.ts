/**
 * API Trace Logger - Logs all API requests and responses for debugging
 */
import * as fs from 'fs';
import * as path from 'path';

export interface ApiTraceEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  error?: string;
}

export class ApiTraceLogger {
  private traces: ApiTraceEntry[] = [];
  private traceFile: string;
  private traceDir: string;

  constructor() {
    this.traceDir = path.join(__dirname, '..', '..', 'allure-results', 'api-traces');
    this.ensureTraceDir();
    this.traceFile = path.join(
      this.traceDir,
      `api-trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`
    );
  }

  private ensureTraceDir() {
    if (!fs.existsSync(this.traceDir)) {
      fs.mkdirSync(this.traceDir, { recursive: true });
    }
  }

  /**
   * Log an API call
   */
  logApiCall(
    method: string,
    url: string,
    status: number,
    duration: number,
    options?: {
      requestHeaders?: Record<string, string>;
      requestBody?: unknown;
      responseHeaders?: Record<string, string>;
      responseBody?: unknown;
      error?: string;
    }
  ) {
    const entry: ApiTraceEntry = {
      timestamp: new Date().toISOString(),
      method,
      url,
      status,
      duration,
      ...options
    };

    this.traces.push(entry);
    this.saveTrace();
  }

  /**
   * Save trace to file
   */
  private saveTrace() {
    try {
      fs.writeFileSync(
        this.traceFile,
        JSON.stringify(this.traces, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving API trace:', error);
    }
  }

  /**
   * Get trace file path
   */
  getTraceFile(): string {
    return this.traceFile;
  }

  /**
   * Get formatted trace as text
   */
  getFormattedTrace(): string {
    let output = 'API TRACE LOG\n';
    output += '=============\n\n';

    this.traces.forEach((entry, index) => {
      output += `Request ${index + 1}\n`;
      output += `---------\n`;
      output += `Timestamp: ${entry.timestamp}\n`;
      output += `Method: ${entry.method}\n`;
      output += `URL: ${entry.url}\n`;
      output += `Status: ${entry.status}\n`;
      output += `Duration: ${entry.duration}ms\n`;

      if (entry.requestHeaders) {
        output += `\nRequest Headers:\n`;
        Object.entries(entry.requestHeaders).forEach(([key, value]) => {
          output += `  ${key}: ${value}\n`;
        });
      }

      if (entry.requestBody) {
        output += `\nRequest Body:\n`;
        output += `${JSON.stringify(entry.requestBody, null, 2)}\n`;
      }

      if (entry.responseHeaders) {
        output += `\nResponse Headers:\n`;
        Object.entries(entry.responseHeaders).forEach(([key, value]) => {
          output += `  ${key}: ${value}\n`;
        });
      }

      if (entry.responseBody) {
        output += `\nResponse Body:\n`;
        output += `${JSON.stringify(entry.responseBody, null, 2)}\n`;
      }

      if (entry.error) {
        output += `\nError:\n`;
        output += `${entry.error}\n`;
      }

      output += `\n`;
    });

    return output;
  }

  /**
   * Clear traces
   */
  clear() {
    this.traces = [];
  }
}

// Global instance
export const apiTraceLogger = new ApiTraceLogger();
