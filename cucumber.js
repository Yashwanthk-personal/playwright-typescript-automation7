require('dotenv').config({ path: '.env.dev' });

module.exports = {
  default: {
    require: ['steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report.html',
      'json:allure-results/cucumber-report.json'
    ],
    formatOptions: { 
      snippetInterface: 'async-await'
    },
  },
};
