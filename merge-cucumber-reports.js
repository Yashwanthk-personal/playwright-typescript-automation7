const fs = require('fs');
const path = require('path');

/**
 * Merge multiple Cucumber JSON reports into a single report
 * Combines results from cucumber-chromium.json, cucumber-firefox.json, cucumber-webkit.json
 */

const browserFiles = [
  'cucumber-chromium.json',
  'cucumber-firefox.json',
  'cucumber-webkit.json'
];

const reportDir = process.cwd();
const outputFile = path.join(reportDir, 'cucumber-report.json');

try {
  let mergedReports = [];

  // Read and merge all browser reports
  for (const browserFile of browserFiles) {
    const filePath = path.join(reportDir, browserFile);
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const reports = JSON.parse(data);
        
        // Add browser info to each feature/scenario
        const browser = browserFile.replace('cucumber-', '').replace('.json', '');
        const enrichedReports = reports.map(feature => ({
          ...feature,
          browser: browser,
          scenarios: feature.elements ? feature.elements.map(scenario => ({
            ...scenario,
            browser: browser
          })) : []
        }));
        
        mergedReports.push(...enrichedReports);
        console.log(`✓ Merged ${browser} report (${reports.length} features)`);
      } catch (err) {
        console.error(`✗ Error reading ${browserFile}:`, err.message);
      }
    }
  }

  // Write merged report
  if (mergedReports.length > 0) {
    fs.writeFileSync(outputFile, JSON.stringify(mergedReports, null, 2));
    console.log(`\n✓ Merged report saved to: ${outputFile}`);
    console.log(`✓ Total features: ${mergedReports.length}`);
  } else {
    console.warn('No browser reports found to merge');
  }
} catch (error) {
  console.error('Error merging reports:', error);
  process.exit(1);
}
