import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Paths and file extensions to ignore from impact analysis
 */
const IGNORED_PATTERNS: string[] = [
  'node_modules/',
  'playwright-report/',
  'allure-report/',
  'allure-results/',
  'test-results/',
  'dist/',
  'build/',
  '.git/',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.pdf',
  '.mp4',
  'cucumber-report.html',
  'bdd-output.txt',
];

/**
 * File paths to include (source code only)
 */
const INCLUDED_DIRECTORIES: string[] = [
  'pages/',
  'utils/',
  'steps/',
  'fixtures/',
  'api/',
  'config/',
];

interface ModuleMapping {
  [moduleName: string]: {
    files: string[];
    tests: string[];
  };
}

interface ImpactAnalysisResult {
  changedFiles: string[];
  filteredFiles: string[];
  impactedModules: string[];
  impactedTests: string[];
}

/**
 * Normalizes file paths to use forward slashes for consistent comparison
 * @param filePath - Path to normalize
 * @returns Normalized path
 */
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Checks if a file should be ignored based on patterns
 * @param filePath - File path to check
 * @returns True if file should be ignored
 */
function shouldIgnoreFile(filePath: string): boolean {
  const normalized = normalizePath(filePath).toLowerCase();

  // Check if file matches any ignored pattern
  for (const pattern of IGNORED_PATTERNS) {
    if (normalized.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a file is from an included directory (source code)
 * @param filePath - File path to check
 * @returns True if file is from an included directory
 */
function isFromIncludedDirectory(filePath: string): boolean {
  const normalized = normalizePath(filePath).toLowerCase();

  for (const dir of INCLUDED_DIRECTORIES) {
    if (normalized.includes(dir.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Executes git diff to get changed files
 * @returns Array of changed file paths
 */
function getChangedFiles(): string[] {
  try {
    const output = execSync('git diff --name-only origin/main...HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (!output) {
      console.log('ℹ️  No changed files detected from git diff.');
      return [];
    }

    const files = output.split('\n').filter((file) => file.length > 0);
    console.log(`📁 Raw git diff returned ${files.length} files`);
    return files;
  } catch (error) {
    console.warn('⚠️  Git diff failed. Check if origin/main branch exists.');
    return [];
  }
}

/**
 * Filters changed files to keep only source code files
 * @param files - Array of changed file paths
 * @returns Filtered array of relevant files
 */
function filterChangedFiles(files: string[]): string[] {
  const filtered = files.filter((file) => {
    const isIgnored = shouldIgnoreFile(file);
    const isIncluded = isFromIncludedDirectory(file);

    // Keep files that are not ignored AND are from included directories
    return !isIgnored && isIncluded;
  });

  return filtered.map(normalizePath);
}

/**
 * Reads and parses the mapping.json file
 * @returns Parsed mapping configuration
 */
function readMappingFile(): ModuleMapping {
  const mappingPath = path.join(process.cwd(), 'mapping.json');

  if (!fs.existsSync(mappingPath)) {
    console.warn(`⚠️  mapping.json not found at ${mappingPath}`);
    return {};
  }

  try {
    const rawData = fs.readFileSync(mappingPath, 'utf-8');
    return JSON.parse(rawData) as ModuleMapping;
  } catch (error) {
    console.error('❌ Error parsing mapping.json:', error);
    return {};
  }
}

/**
 * Identifies impacted modules based on changed files
 * @param filteredFiles - Array of filtered changed file paths
 * @param mapping - Module mapping configuration
 * @returns Array of impacted module names
 */
function getImpactedModules(
  filteredFiles: string[],
  mapping: ModuleMapping
): string[] {
  const impactedModules = new Set<string>();

  if (filteredFiles.length === 0) {
    console.log('ℹ️  No files to match after filtering.');
    return [];
  }

  for (const [moduleName, config] of Object.entries(mapping)) {
    if (!config.files || config.files.length === 0) {
      continue;
    }

    // Check if any changed file matches any file in this module
    const isModuleImpacted = config.files.some((mappingFile) => {
      const normalizedMappingFile = normalizePath(mappingFile);

      return filteredFiles.some((changedFile) => {
        const normalizedChangedFile = normalizePath(changedFile);

        // Match: exact match or changed file ends with mapping file
        const exactMatch = normalizedChangedFile === normalizedMappingFile;
        const endMatch = normalizedChangedFile.endsWith(normalizedMappingFile);

        return exactMatch || endMatch;
      });
    });

    if (isModuleImpacted) {
      impactedModules.add(moduleName);
    }
  }

  return Array.from(impactedModules);
}

/**
 * Gets test files for impacted modules
 * @param modules - Array of impacted module names
 * @param mapping - Module mapping configuration
 * @returns Array of test file paths
 */
function getImpactedTestsFromModules(
  modules: string[],
  mapping: ModuleMapping
): string[] {
  const impactedTests = new Set<string>();

  for (const moduleName of modules) {
    const config = mapping[moduleName];
    if (config && config.tests && config.tests.length > 0) {
      config.tests.forEach((test) => {
        impactedTests.add(normalizePath(test));
      });
    }
  }

  return Array.from(impactedTests);
}

/**
 * Gets all test files from the project recursively
 * @returns Array of all test file paths
 */
function getAllTestFiles(): string[] {
  const testDir = path.join(process.cwd(), 'tests');
  const testFiles: string[] = [];

  try {
    if (!fs.existsSync(testDir)) {
      console.warn(`⚠️  Tests directory not found at ${testDir}`);
      return [];
    }

    const walkDir = (dir: string): void => {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.spec.ts')) {
          const relativePath = path.relative(process.cwd(), filePath);
          testFiles.push(normalizePath(relativePath));
        }
      });
    };

    walkDir(testDir);
    return testFiles;
  } catch (error) {
    console.error('❌ Error finding test files:', error);
    return [];
  }
}

/**
 * Main function to perform impact analysis and return impacted tests
 * @returns Array of test file paths to run
 */
export function getImpactedTests(): string[] {
  const mapping = readMappingFile();

  if (Object.keys(mapping).length === 0) {
    console.warn('⚠️  Mapping is empty. Returning all tests as fallback.');
    return getAllTestFiles();
  }

  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('ℹ️  No changes detected. Running all tests.');
    return getAllTestFiles();
  }

  const filteredFiles = filterChangedFiles(changedFiles);

  if (filteredFiles.length === 0) {
    console.log('ℹ️  All changes filtered out (build artifacts, reports, etc.). Running all tests.');
    return getAllTestFiles();
  }

  const impactedModules = getImpactedModules(filteredFiles, mapping);
  let impactedTests = getImpactedTestsFromModules(impactedModules, mapping);

  // Fallback: if no impacted tests found, return all test files
  if (impactedTests.length === 0) {
    console.log('⚠️  No impacted tests matched. Running all tests as fallback.');
    impactedTests = getAllTestFiles();
  }

  return impactedTests;
}

/**
 * Displays impact analysis results in a formatted manner
 */
function displayResults(result: ImpactAnalysisResult): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        📊 IMPACT ANALYSIS RESULTS                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Changed Files
  console.log('📋 Raw Changed Files:', result.changedFiles.length);
  if (result.changedFiles.length > 0 && result.changedFiles.length <= 10) {
    result.changedFiles.forEach((file) => console.log(`   • ${file}`));
  } else if (result.changedFiles.length > 10) {
    result.changedFiles.slice(0, 5).forEach((file) => console.log(`   • ${file}`));
    console.log(`   ... and ${result.changedFiles.length - 5} more`);
  }

  // Filtered Files
  console.log(`\n🔍 Filtered Files (after cleanup): ${result.filteredFiles.length}`);
  result.filteredFiles.forEach((file) => console.log(`   • ${file}`));

  // Impacted Modules
  console.log(`\n📦 Impacted Modules: ${result.impactedModules.length}`);
  result.impactedModules.forEach((module) => console.log(`   • ${module}`));

  // Impacted Tests
  console.log(`\n🧪 Impacted Tests: ${result.impactedTests.length}`);
  result.impactedTests.forEach((test) => console.log(`   • ${test}`));

  // Summary
  const summary = `✅ Summary: ${result.changedFiles.length} files changed → ${result.filteredFiles.length} relevant → ${result.impactedModules.length} modules → ${result.impactedTests.length} tests`;
  console.log(`\n${summary}\n`);

  // JSON output for CI/CD
  console.log('📋 JSON Output:');
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Executes impact analysis and displays results
 */
function runImpactAnalysis(): void {
  console.log('\n🔍 Starting Impact Analysis...\n');

  const mapping = readMappingFile();
  const changedFiles = getChangedFiles();
  const filteredFiles = filterChangedFiles(changedFiles);
  const impactedModules = getImpactedModules(filteredFiles, mapping);
  let impactedTests = getImpactedTestsFromModules(impactedModules, mapping);

  // Fallback: if no impacted tests found, return all test files
  if (impactedTests.length === 0) {
    console.log('⚠️  No impacted tests matched. Falling back to all tests...');
    impactedTests = getAllTestFiles();
  }

  const result: ImpactAnalysisResult = {
    changedFiles,
    filteredFiles,
    impactedModules,
    impactedTests,
  };

  displayResults(result);
}

// Execute if run directly
if (require.main === module) {
  runImpactAnalysis();
}
