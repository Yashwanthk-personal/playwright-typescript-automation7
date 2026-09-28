/**
 * API Visual Testing/Snapshot Utilities - Capture and compare API response structure
 */
import * as fs from 'fs';
import * as path from 'path';

export interface ApiSnapshot {
  name: string;
  headers?: Record<string, string>;
  body?: unknown;
  status?: number;
  timestamp: number;
  testName?: string;
}

export interface SnapshotComparison {
  name1: string;
  name2: string;
  structureMatch: boolean;
  valuesMatch: boolean;
  differences: string[];
}

/**
 * API Snapshot Manager - Capture and manage API response snapshots
 */
export class ApiSnapshotManager {
  private snapshots: Map<string, ApiSnapshot> = new Map();
  private baselines: Map<string, ApiSnapshot> = new Map();
  private readonly SNAPSHOT_DIR = path.join(__dirname, '..', '..', 'allure-results', 'api-snapshots');
  private readonly BASELINE_DIR = path.join(__dirname, '..', '..', 'allure-results', 'api-baselines');
  private metrics: Map<string, { duration: number; timestamp: number }> = new Map();

  constructor() {
    this.initializeDirectories();
  }

  /**
   * Initialize snapshot directories
   */
  private initializeDirectories(): void {
    if (!fs.existsSync(this.SNAPSHOT_DIR)) {
      fs.mkdirSync(this.SNAPSHOT_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.BASELINE_DIR)) {
      fs.mkdirSync(this.BASELINE_DIR, { recursive: true });
    }
  }

  /**
   * Capture API response as snapshot
   */
  captureSnapshot(
    name: string,
    body: unknown,
    headers?: Record<string, string>,
    status?: number,
    testName?: string
  ): void {
    const snapshot: ApiSnapshot = {
      name,
      body,
      headers,
      status,
      timestamp: Date.now(),
      testName,
    };

    this.snapshots.set(name, snapshot);
    this.saveSnapshot(name, snapshot);
  }

  /**
   * Capture specific headers as snapshot
   */
  captureHeadersSnapshot(name: string, headers: Record<string, string>): void {
    this.snapshots.set(name, {
      name,
      headers,
      timestamp: Date.now(),
    });
    this.saveSnapshot(name, this.snapshots.get(name)!);
  }

  /**
   * Capture specific body as snapshot
   */
  captureBodySnapshot(name: string, body: unknown): void {
    this.snapshots.set(name, {
      name,
      body,
      timestamp: Date.now(),
    });
    this.saveSnapshot(name, this.snapshots.get(name)!);
  }

  /**
   * Capture request metrics (duration, etc.)
   */
  captureMetric(name: string, duration: number): void {
    this.metrics.set(name, {
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Get captured metric
   */
  getMetric(name: string): { duration: number; timestamp: number } | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all metrics as timeline data
   */
  getMetricsTimeline(): Record<string, number> {
    const timeline: Record<string, number> = {};
    this.metrics.forEach((metric, name) => {
      timeline[name] = metric.duration;
    });
    return timeline;
  }

  /**
   * Get captured snapshot
   */
  getSnapshot(name: string): ApiSnapshot | undefined {
    return this.snapshots.get(name);
  }

  /**
   * Load or create baseline
   */
  createBaseline(name: string): void {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) {
      throw new Error(`Snapshot '${name}' not found. Cannot create baseline.`);
    }

    this.baselines.set(name, snapshot);
    this.saveBaseline(name, snapshot);
  }

  /**
   * Load baseline
   */
  loadBaseline(name: string): ApiSnapshot | undefined {
    try {
      const baselineFile = path.join(this.BASELINE_DIR, `${name}.json`);
      if (fs.existsSync(baselineFile)) {
        const data = fs.readFileSync(baselineFile, 'utf-8');
        const baseline = JSON.parse(data);
        this.baselines.set(name, baseline);
        return baseline;
      }
    } catch (error) {
      console.warn(`Failed to load baseline '${name}':`, error);
    }
    return undefined;
  }

  /**
   * Compare snapshot against baseline
   */
  compareAgainstBaseline(name: string): SnapshotComparison {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) {
      throw new Error(`Snapshot '${name}' not found`);
    }

    const baseline = this.loadBaseline(name);
    if (!baseline) {
      throw new Error(`Baseline '${name}' not found. Create baseline first.`);
    }

    const differences: string[] = [];
    const structureMatch = this.compareStructure(snapshot.body, baseline.body, differences);
    const valuesMatch = JSON.stringify(snapshot) === JSON.stringify(baseline);

    return {
      name1: name,
      name2: `${name}-baseline`,
      structureMatch,
      valuesMatch,
      differences,
    };
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(name1: string, name2: string): SnapshotComparison {
    const snapshot1 = this.snapshots.get(name1);
    const snapshot2 = this.snapshots.get(name2);

    if (!snapshot1 || !snapshot2) {
      throw new Error(`Snapshots '${name1}' or '${name2}' not found`);
    }

    const differences: string[] = [];
    const structureMatch = this.compareStructure(snapshot1.body, snapshot2.body, differences);
    const valuesMatch = JSON.stringify(snapshot1.body) === JSON.stringify(snapshot2.body);

    // Check for similar keys but different values
    if (structureMatch && !valuesMatch) {
      differences.push('Keys match but values differ (expected for data variations)');
    }

    return {
      name1,
      name2,
      structureMatch,
      valuesMatch,
      differences,
    };
  }

  /**
   * Compare structure of two objects recursively
   */
  private compareStructure(
    obj1: unknown,
    obj2: unknown,
    differences: string[],
    path: string = 'root'
  ): boolean {
    if (typeof obj1 !== typeof obj2) {
      differences.push(`Type mismatch at '${path}': ${typeof obj1} vs ${typeof obj2}`);
      return false;
    }

    if (obj1 === null || obj2 === null) {
      if (obj1 !== obj2) {
        differences.push(`Null mismatch at '${path}'`);
        return false;
      }
      return true;
    }

    if (typeof obj1 !== 'object') {
      return true; // Primitives match by type
    }

    const keys1 = Object.keys(obj1 as Record<string, unknown>);
    const keys2 = Object.keys(obj2 as Record<string, unknown>);

    if (keys1.length !== keys2.length) {
      differences.push(
        `Key count mismatch at '${path}': ${keys1.length} vs ${keys2.length}`
      );
      return false;
    }

    const missingKeys = keys1.filter((k) => !keys2.includes(k));
    if (missingKeys.length > 0) {
      differences.push(`Missing keys at '${path}': ${missingKeys.join(', ')}`);
      return false;
    }

    let allMatch = true;
    keys1.forEach((key) => {
      const val1 = (obj1 as Record<string, unknown>)[key];
      const val2 = (obj2 as Record<string, unknown>)[key];
      const newPath = `${path}.${key}`;

      if (!this.compareStructure(val1, val2, differences, newPath)) {
        allMatch = false;
      }
    });

    return allMatch;
  }

  /**
   * Save snapshot to file
   */
  private saveSnapshot(name: string, snapshot: ApiSnapshot): void {
    const filePath = path.join(this.SNAPSHOT_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  }

  /**
   * Save baseline to file
   */
  private saveBaseline(name: string, snapshot: ApiSnapshot): void {
    const filePath = path.join(this.BASELINE_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  }

  /**
   * Clear all snapshots
   */
  clear(): void {
    this.snapshots.clear();
    this.baselines.clear();
    this.metrics.clear();
  }

  /**
   * Get all snapshots
   */
  getAllSnapshots(): Map<string, ApiSnapshot> {
    return new Map(this.snapshots);
  }

  /**
   * Export snapshots as HTML report
   */
  exportAsHtmlReport(testName: string): string {
    const snapshots = Array.from(this.snapshots.values());
    if (snapshots.length === 0) {
      return '<p>No snapshots captured</p>';
    }

    let html = `<h2>API Snapshots for ${testName}</h2>`;
    html += '<table border="1" cellpadding="10">';
    html += '<tr><th>Name</th><th>Status</th><th>Body</th><th>Headers</th></tr>';

    snapshots.forEach((snap) => {
      html += '<tr>';
      html += `<td>${snap.name}</td>`;
      html += `<td>${snap.status || 'N/A'}</td>`;
      html += `<td><pre>${JSON.stringify(snap.body, null, 2)}</pre></td>`;
      html += `<td><pre>${JSON.stringify(snap.headers, null, 2)}</pre></td>`;
      html += '</tr>';
    });

    html += '</table>';
    return html;
  }
}

// Global snapshot manager instance
export const apiSnapshotManager = new ApiSnapshotManager();
