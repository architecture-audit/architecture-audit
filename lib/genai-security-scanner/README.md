# 🛡️ GenAI Security Scanner

Automated security scanner for GenAI/LLM systems that detects and measures security parameters without manual configuration.

## Features

- 🔍 **Auto-Discovery**: Automatically detects security parameters
- 📊 **OWASP LLM Top 10**: Full compliance mapping and scoring
- 🎯 **Multi-Provider Support**: Works with any LLM provider
- 🔵 **Blue Team Monitoring**: Real-time threat detection
- 📈 **Comprehensive Metrics**: Injection rates, hallucination scores, bias detection
- 🚀 **Zero Configuration**: Point and scan - no setup required

## Installation

```bash
npm install genai-security-scanner
```

## Quick Start

### Simple Usage (Parameterized)

```javascript
const GenAIScanner = require('genai-security-scanner');

// Just specify provider and model - that's it!
const scanner = new GenAIScanner({
    provider: 'openai',
    model: 'gpt-4',
    apiKey: 'your-api-key'  // or use environment variable
});

const results = await scanner.scan();
console.log(`Security Score: ${results.compliance.owasp.overallScore}%`);
```

## Supported Providers & Models

### OpenAI
```javascript
{
    provider: 'openai',
    model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY
}
```

### Anthropic Claude
```javascript
{
    provider: 'anthropic',
    model: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307',
    apiKey: process.env.ANTHROPIC_API_KEY
}
```

### Google AI
```javascript
{
    provider: 'google',
    model: 'gemini-pro' | 'gemini-pro-vision' | 'palm-2',
    apiKey: process.env.GOOGLE_API_KEY
}
```

### Azure OpenAI
```javascript
{
    provider: 'azure',
    model: 'gpt-4' | 'gpt-35-turbo',
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    azureResource: 'your-resource-name',
    azureDeployment: 'your-deployment-name'
}
```

### Cohere
```javascript
{
    provider: 'cohere',
    model: 'command' | 'command-light' | 'command-nightly',
    apiKey: process.env.COHERE_API_KEY
}
```

### HuggingFace
```javascript
{
    provider: 'huggingface',
    model: 'mistralai/Mistral-7B-Instruct-v0.2' | 'meta-llama/Llama-2-70b-chat-hf',
    apiKey: process.env.HUGGINGFACE_API_KEY
}
```

### Local Models (Ollama)
```javascript
{
    provider: 'ollama',
    model: 'llama2' | 'mistral' | 'codellama' | 'mixtral',
    // No API key needed for local models
}
```

### Replicate
```javascript
{
    provider: 'replicate',
    model: 'meta/llama-2-70b-chat' | 'mistralai/mistral-7b-instruct',
    apiKey: process.env.REPLICATE_API_KEY
}
```

## CLI Usage

### Interactive Mode
```bash
genai-scan -i
# Follow the prompts to select provider, model, and scan options
```

### Direct Command
```bash
# OpenAI GPT-4
genai-scan -p openai -m gpt-4 --mode comprehensive

# Anthropic Claude
genai-scan -p anthropic -m claude-3-sonnet-20240229

# Local Ollama
genai-scan -p ollama -m llama2 --mode quick

# List all available models
genai-scan --list
```

### Environment Variables
```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GOOGLE_API_KEY="..."

# Then just specify provider and model
genai-scan -p openai -m gpt-4
```

## Configuration Options

```javascript
const scanner = new GenAIScanner({
    // Required
    provider: 'openai',        // Provider name
    model: 'gpt-4',            // Model name

    // Optional
    apiKey: 'your-key',        // API key (or use env variable)
    mode: 'comprehensive',     // 'quick' | 'standard' | 'comprehensive'
    temperature: 0.7,          // Model temperature
    maxTokens: 150,           // Max response tokens

    // Advanced
    parallel: true,           // Run tests in parallel
    timeout: 30000,          // Request timeout in ms
    realtime: true,          // Enable real-time monitoring
    verbose: false,          // Verbose output

    // Azure-specific
    azureResource: 'name',   // Azure resource name
    azureDeployment: 'name', // Azure deployment name
});
```

## Scan Modes

### Quick Mode (5-10 tests)
```javascript
{ mode: 'quick' }
// Basic security checks, ~1 minute
```

### Standard Mode (20-30 tests)
```javascript
{ mode: 'standard' }  // Default
// Comprehensive security assessment, ~5 minutes
```

### Comprehensive Mode (50+ tests)
```javascript
{ mode: 'comprehensive' }
// Full security audit with all test vectors, ~15 minutes
```

## Output Example

```javascript
{
    "systemInfo": {
        "modelType": "GPT-4",
        "version": "0613",
        "securityFeatures": ["prompt_injection_protection", "safety_guidelines"]
    },
    "vulnerabilities": {
        "promptInjection": {
            "rate": 15,
            "vulnerableVectors": ["encoding", "contextManipulation"],
            "confidence": 85
        },
        "dataLeakage": {
            "rate": 5,
            "piiLeakage": 2,
            "confidence": 90
        },
        "hallucination": {
            "rate": 12,
            "accuracy": 88,
            "confidence": 80
        }
    },
    "compliance": {
        "owasp": {
            "overallScore": 75,
            "compliance": "ADEQUATE",
            "maturityLevel": "Defined",
            "categories": {
                "LLM01": { "score": 70, "gaps": [...] },
                "LLM02": { "score": 85, "gaps": [...] }
                // ... all 10 categories
            }
        }
    },
    "riskProfile": {
        "score": 25,
        "level": "MEDIUM",
        "factors": ["prompt_injection", "hallucination"]
    },
    "recommendations": [
        {
            "severity": "HIGH",
            "category": "Prompt Security",
            "recommendation": "Implement multi-layer input validation",
            "effort": "Medium",
            "impact": "High"
        }
        // ... more recommendations
    ]
}
```

## Real-Time Monitoring

```javascript
// Enable real-time threat detection
const scanner = new GenAIScanner({
    provider: 'openai',
    model: 'gpt-4',
    realtime: true
});

// Listen for threats
scanner.startMonitoring((threat) => {
    console.log(`Threat detected: ${threat.type}`);
    console.log(`Severity: ${threat.severity}`);

    // Automatic response
    if (threat.severity === 'CRITICAL') {
        // Block request, alert admin, etc.
    }
});
```

## Custom Endpoints

For custom or self-hosted LLMs:

```javascript
const scanner = new GenAIScanner({
    provider: 'custom',
    target: 'https://your-api.com/v1/chat',
    apiKey: 'your-api-key',
    headers: {
        'X-Custom-Header': 'value'
    },
    requestFormat: (prompt) => ({
        query: prompt,
        temperature: 0.7
    }),
    responseFormat: (data) => data.result
});
```

## API Reference

### Main Methods

#### `scanner.scan()`
Run comprehensive security scan
```javascript
const results = await scanner.scan();
```

#### `scanner.testPromptInjection()`
Test only prompt injection vulnerability
```javascript
const injectionResults = await scanner.scanner.testPromptInjection();
```

#### `scanner.startMonitoring(callback)`
Start real-time monitoring
```javascript
scanner.startMonitoring((threat) => {
    // Handle threat
});
```

#### `scanner.generateReport(format)`
Generate report in specified format
```javascript
const report = await scanner.generateReport('json' | 'html' | 'pdf');
```

## Testing Without API Keys

The scanner includes a mock mode for testing:

```javascript
const scanner = new GenAIScanner({
    target: 'mock://test',
    mode: 'quick'
});

// Will use mock responses for testing
const results = await scanner.scan();
```

## Examples

See the `examples/` directory for complete examples:

- `basic-scan.js` - Simple security scan
- `multi-provider.js` - Testing multiple providers
- `real-time-monitor.js` - Real-time threat detection
- `custom-endpoint.js` - Custom LLM integration
- `compliance-report.js` - OWASP compliance reporting

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Issues: [GitHub Issues](https://github.com/your-org/genai-security-scanner/issues)
- Documentation: [Full Docs](https://docs.your-site.com)

---

Made with ❤️ by the AI Architecture Audit Team