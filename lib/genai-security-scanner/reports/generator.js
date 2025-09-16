class ReportGenerator {
  async generate(results, format) {
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    } else if (format === 'html') {
      return '<html><body><h1>Security Report</h1><pre>' + 
             JSON.stringify(results, null, 2) + 
             '</pre></body></html>';
    }
    return results;
  }
}

module.exports = ReportGenerator;