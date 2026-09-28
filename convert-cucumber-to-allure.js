/**
 * Convert Cucumber JSON format to Allure JSON format
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const cucumberJsonPath = 'allure-results/cucumber-report.json';
const allureResultsDir = 'allure-results';
const tracesDir = path.join(allureResultsDir, 'traces');
const apiTracesDir = path.join(allureResultsDir, 'api-traces');

/**
 * Get available Playwright trace files
 */
function getPlaywrightTraces() {
  try {
    if (!fs.existsSync(tracesDir)) {
      return [];
    }
    
    const traceFiles = fs.readdirSync(tracesDir)
      .filter(file => file.startsWith('trace-') && file.endsWith('.zip'))
      .map(file => ({
        name: file,
        path: path.join(tracesDir, file),
        timestamp: parseInt(file.match(/trace-(\d+)-/)[1]),
        mtime: fs.statSync(path.join(tracesDir, file)).mtime.getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return traceFiles;
  } catch (error) {
    return [];
  }
}

/**
 * Get available API trace files
 */
function getApiTraces() {
  try {
    if (!fs.existsSync(apiTracesDir)) {
      return [];
    }
    
    const traceFiles = fs.readdirSync(apiTracesDir)
      .filter(file => file.startsWith('api-trace-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(apiTracesDir, file),
        timestamp: parseInt(file.match(/api-trace-(\d+)-/)[1]),
        mtime: fs.statSync(path.join(apiTracesDir, file)).mtime.getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return traceFiles;
  } catch (error) {
    return [];
  }
}

/**
 * Extract step code from file
 */
function getStepCode(location) {
  try {
    if (!location) return null;
    
    // Parse location: "steps\\api\\login-api.steps.ts:17"
    const parts = location.split(':');
    const filePath = parts[0].replace(/\\/g, '/');
    const lineNumber = parseInt(parts[1]);
    
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return null;
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract code around the step definition (5 lines before and after)
    const startLine = Math.max(0, lineNumber - 6);
    const endLine = Math.min(lines.length, lineNumber + 5);
    const codeSnippet = lines.slice(startLine, endLine).join('\n');
    
    return {
      filePath: filePath,
      lineNumber: lineNumber,
      code: codeSnippet
    };
  } catch (error) {
    return null;
  }
}

function convertCucumberToAllure() {
  try {
    // Read Cucumber JSON
    const cucumberJson = JSON.parse(fs.readFileSync(cucumberJsonPath, 'utf-8'));
    
    // Get available Playwright and API traces
    const playwrightTraces = getPlaywrightTraces();
    const apiTraces = getApiTraces();
    let traceIndex = 0;
    let apiTraceIndex = 0;
    
    // Process each feature
    cucumberJson.forEach((feature, featureIndex) => {
      const featureName = feature.name || 'Unknown Feature';
      const featurePath = feature.uri || 'Unknown URI';
      
      // Read feature file content
      let featureFileContent = '';
      try {
        const fullFeaturePath = path.join(__dirname, featurePath.replace(/\//g, path.sep));
        if (fs.existsSync(fullFeaturePath)) {
          featureFileContent = fs.readFileSync(fullFeaturePath, 'utf-8');
        }
      } catch (error) {
        // Feature file not found, skip
      }
      
      // Process each scenario
      feature.elements.forEach((scenario, scenarioIndex) => {
        const scenarioName = scenario.name || 'Unknown Scenario';
        const testId = uuidv4();
        
        // Determine status
        let status = 'passed';
        let statusDetails = null;
        
        scenario.steps.forEach(step => {
          if (step.result.status === 'failed') {
            status = 'failed';
            statusDetails = {
              message: step.result.error_message || 'Step failed',
              trace: step.result.error_message || ''
            };
          } else if (step.result.status === 'skipped') {
            if (status !== 'failed') {
              status = 'skipped';
            }
          }
        });
        
        // Calculate duration
        const duration = scenario.steps.reduce((sum, step) => {
          return sum + (step.result.duration || 0);
        }, 0);
        
        // Create Allure test result JSON with enhanced step details
        const allureResult = {
          uuid: testId,
          name: scenarioName,
          fullName: `${featureName} > ${scenarioName}`,
          status: status,
          statusDetails: statusDetails,
          stage: 'finished',
          start: Date.now(),
          stop: Date.now(),
          duration: duration,
          description: scenario.description || '',
          labels: [
            {
              name: 'feature',
              value: featureName
            },
            {
              name: 'story',
              value: scenarioName
            },
            {
              name: 'severity',
              value: 'normal'
            },
            {
              name: 'type',
              value: 'api'
            }
          ],
          steps: scenario.steps.map((step, stepIndex) => {
            const stepCode = getStepCode(step.match?.location);
            const allureStep = {
              name: step.name,
              status: step.result.status,
              stage: 'finished',
              start: Date.now(),
              stop: Date.now(),
              duration: step.result.duration || 0,
              parameters: [
                {
                  name: 'Location',
                  value: step.match?.location || 'Unknown'
                }
              ],
              attachments: []
            };
            
            // Build trace information
            let traceInfo = '';
            traceInfo += `STEP TRACE\n`;
            traceInfo += `==========\n\n`;
            traceInfo += `Name: ${step.name}\n`;
            traceInfo += `Keyword: ${step.keyword?.trim() || 'Step'}\n`;
            traceInfo += `Status: ${step.result.status}\n`;
            traceInfo += `Duration: ${((step.result.duration || 0) / 1000000).toFixed(2)}ms\n`;
            traceInfo += `Location: ${step.match?.location || 'Unknown'}\n`;
            traceInfo += `Line: ${step.line || 'Unknown'}\n`;
            
            if (step.result.error_message) {
              traceInfo += `\n--- ERROR DETAILS ---\n`;
              traceInfo += step.result.error_message;
            }
            
            // Add code as parameter for display in report
            if (stepCode) {
              allureStep.parameters.push({
                name: 'Implementation',
                value: stepCode.code
              });
              
              // Create code attachment
              const attachmentId = uuidv4();
              const codeAttachment = {
                name: 'Step Implementation',
                source: `${attachmentId}-attachment.txt`,
                type: 'text/plain'
              };
              allureStep.attachments.push(codeAttachment);
              
              // Write attachment file
              const attachmentPath = path.join(allureResultsDir, `${attachmentId}-attachment.txt`);
              fs.writeFileSync(attachmentPath, stepCode.code, 'utf-8');
            }
            
            // Add trace as attachment
            const traceAttachmentId = uuidv4();
            const traceAttachment = {
              name: 'Trace',
              source: `${traceAttachmentId}-trace.txt`,
              type: 'text/plain'
            };
            allureStep.attachments.push(traceAttachment);
            
            const traceAttachmentPath = path.join(allureResultsDir, `${traceAttachmentId}-trace.txt`);
            fs.writeFileSync(traceAttachmentPath, traceInfo, 'utf-8');
            
            // Add step keyword
            allureStep.parameters.push({
              name: 'Keyword',
              value: step.keyword?.trim() || 'Step'
            });
            
            // Add execution time
            allureStep.parameters.push({
              name: 'Duration (ms)',
              value: ((step.result.duration || 0) / 1000000).toFixed(2)
            });
            
            // Add step status
            allureStep.parameters.push({
              name: 'Status',
              value: step.result.status
            });
            
            // Add parameters/arguments if present
            if (step.arguments && step.arguments.length > 0) {
              step.arguments.forEach((arg, idx) => {
                allureStep.parameters.push({
                  name: `Argument ${idx}`,
                  value: JSON.stringify(arg)
                });
              });
            }
            
            // Add error details if step failed
            if (step.result.status === 'failed' && step.result.error_message) {
              const errorAttachmentId = uuidv4();
              const errorAttachment = {
                name: 'Error Details',
                source: `${errorAttachmentId}-error.txt`,
                type: 'text/plain'
              };
              allureStep.attachments.push(errorAttachment);
              
              const errorAttachmentPath = path.join(allureResultsDir, `${errorAttachmentId}-error.txt`);
              fs.writeFileSync(errorAttachmentPath, step.result.error_message, 'utf-8');
              
              allureStep.parameters.push({
                name: 'Error',
                value: step.result.error_message.split('\n')[0]
              });
            }
            
            return allureStep;
          }),
          attachments: [],
          parameters: [
            {
              name: 'Feature File',
              value: featurePath
            },
            {
              name: 'Feature Name',
              value: featureName
            },
            {
              name: 'Scenario',
              value: scenarioName
            }
          ]
        };
        
        // Add feature file content as attachment
        if (featureFileContent) {
          const featureAttachmentId = uuidv4();
          const featureAttachment = {
            name: 'Feature File',
            source: `${featureAttachmentId}-feature.txt`,
            type: 'text/plain'
          };
          allureResult.attachments.push(featureAttachment);
          
          const featureAttachmentPath = path.join(allureResultsDir, `${featureAttachmentId}-feature.txt`);
          fs.writeFileSync(featureAttachmentPath, featureFileContent, 'utf-8');
        }
        
        // Add scenario gherkin as parameter
        let scenarioGherkin = `Scenario: ${scenarioName}\n`;
        scenario.steps.forEach(step => {
          scenarioGherkin += `  ${step.keyword}${step.name}\n`;
        });
        
        allureResult.parameters.push({
          name: 'Gherkin Steps',
          value: scenarioGherkin
        });
        
        // Add scenario gherkin as attachment for better visibility
        const gherkinAttachmentId = uuidv4();
        const gherkinAttachment = {
          name: 'Scenario Gherkin',
          source: `${gherkinAttachmentId}-gherkin.txt`,
          type: 'text/plain'
        };
        allureResult.attachments.push(gherkinAttachment);
        
        const gherkinAttachmentPath = path.join(allureResultsDir, `${gherkinAttachmentId}-gherkin.txt`);
        fs.writeFileSync(gherkinAttachmentPath, scenarioGherkin, 'utf-8');
        
        // Add Playwright trace to test result if available
        if (traceIndex < playwrightTraces.length) {
          const traceFile = playwrightTraces[traceIndex];
          const traceDestName = `${testId}-trace.zip`;
          const traceDestPath = path.join(allureResultsDir, traceDestName);
          
          // Copy trace file
          fs.copyFileSync(traceFile.path, traceDestPath);
          
          allureResult.attachments.push({
            name: 'Playwright Trace',
            source: traceDestName,
            type: 'application/zip'
          });
          
          allureResult.parameters.push({
            name: 'Playwright Trace',
            value: `Included: ${traceFile.name}`
          });
          
          traceIndex++;
        }
        
        // Add API trace to test result if available
        if (apiTraceIndex < apiTraces.length) {
          const apiTraceFile = apiTraces[apiTraceIndex];
          const apiTraceDestName = `${testId}-api-trace.json`;
          const apiTraceDestPath = path.join(allureResultsDir, apiTraceDestName);
          
          // Copy API trace file
          fs.copyFileSync(apiTraceFile.path, apiTraceDestPath);
          
          allureResult.attachments.push({
            name: 'API Trace',
            source: apiTraceDestName,
            type: 'application/json'
          });
          
          allureResult.parameters.push({
            name: 'API Trace',
            value: `Included: ${apiTraceFile.name}`
          });
          
          apiTraceIndex++;
        }
        
        // Write individual test result JSON file
        const testResultFilename = path.join(allureResultsDir, `${testId}-result.json`);
        fs.writeFileSync(testResultFilename, JSON.stringify(allureResult, null, 2));
        
        const traceIndicator = allureResult.attachments.length > 0 ? ' 📹' : '';
        console.log(`✓ Converted: ${scenarioName} (${status})${traceIndicator}`);
      });
    });
    
    console.log(`\n✓ Conversion complete! Allure report ready to generate.`);
    console.log(`✓ Playwright traces: ${playwrightTraces.length} found`);
    console.log(`✓ API traces: ${apiTraces.length} found`);
    
  } catch (error) {
    console.error('Error converting Cucumber JSON to Allure format:', error);
    process.exit(1);
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

convertCucumberToAllure();
