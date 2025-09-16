/**
 * LLM Connector
 * Handles connections to various LLM APIs (OpenAI, Anthropic, Custom endpoints)
 */

const axios = require('axios');
const { getProviderConfig, getModelConfig } = require('../config/providers');

class LLMConnector {
    constructor(config) {
        this.config = this.parseConfig(config);
        this.provider = null;
        this.model = null;
        this.initialized = false;

        // Statistics for monitoring
        this.stats = {
            totalQueries: 0,
            totalTokens: 0,
            totalCost: 0,
            avgResponseTime: 0,
            errors: 0
        };
    }

    /**
     * Parse and validate configuration
     */
    parseConfig(config) {
        // Support both old and new config formats
        const parsedConfig = { ...config };

        // If provider is specified, use parameterized configuration
        if (config.provider) {
            const providerConfig = getProviderConfig(config.provider);
            const modelConfig = getModelConfig(config.provider, config.model);

            parsedConfig.providerName = config.provider;
            parsedConfig.providerConfig = providerConfig;
            parsedConfig.modelName = modelConfig.name;
            parsedConfig.modelConfig = modelConfig.config;

            // Set endpoint
            if (providerConfig.urlBuilder) {
                parsedConfig.endpoint = providerConfig.urlBuilder(
                    modelConfig.name,
                    config.apiKey,
                    config
                );
            } else {
                parsedConfig.endpoint = providerConfig.endpoint;
            }
        } else if (config.target) {
            // Legacy configuration with target URL
            parsedConfig.endpoint = config.target;
            parsedConfig.providerName = this.detectLLMType(config);
        } else {
            // Default to OpenAI
            parsedConfig.provider = 'openai';
            parsedConfig.providerName = 'openai';
            parsedConfig.providerConfig = getProviderConfig('openai');
            const modelConfig = getModelConfig('openai', config.model || 'gpt-3.5-turbo');
            parsedConfig.modelName = modelConfig.name;
            parsedConfig.modelConfig = modelConfig.config;
        }

        // API Key handling
        parsedConfig.apiKey = config.apiKey ||
                             process.env[`${parsedConfig.providerName.toUpperCase()}_API_KEY`] ||
                             process.env.LLM_API_KEY;

        return parsedConfig;
    }

    /**
     * Detect LLM type from configuration
     */
    detectLLMType(config) {
        if (config.type) return config.type;

        if (config.target) {
            if (config.target.includes('openai.com')) return 'openai';
            if (config.target.includes('anthropic.com')) return 'anthropic';
            if (config.target.includes('huggingface.co')) return 'huggingface';
            if (config.target.includes('cohere.ai')) return 'cohere';
            if (config.target.includes('localhost') || config.target.includes('127.0.0.1')) return 'local';
        }

        if (config.apiKey) {
            if (config.apiKey.startsWith('sk-')) return 'openai';
            if (config.apiKey.startsWith('sk-ant-')) return 'anthropic';
        }

        return 'custom';
    }

    /**
     * Initialize the appropriate client
     */
    async initialize() {
        if (this.initialized) return;

        // Use provider name from config if available
        const providerType = this.config.providerName || this.type || this.detectLLMType(this.config);

        switch (providerType) {
            case 'openai':
                await this.initializeOpenAI();
                break;
            case 'anthropic':
                await this.initializeAnthropic();
                break;
            case 'huggingface':
                await this.initializeHuggingFace();
                break;
            case 'ollama':
            case 'local':
                await this.initializeLocal();
                break;
            case 'google':
                await this.initializeGoogle();
                break;
            case 'azure':
                await this.initializeAzure();
                break;
            case 'cohere':
                await this.initializeCohere();
                break;
            case 'replicate':
                await this.initializeReplicate();
                break;
            case 'custom':
            default:
                await this.initializeCustom();
                break;
        }

        this.initialized = true;
        console.log(`✅ Initialized ${providerType} LLM connector`);
    }

    /**
     * Initialize OpenAI client
     */
    async initializeOpenAI() {
        try {
            const OpenAI = require('openai');
            this.client = new OpenAI({
                apiKey: this.config.apiKey || process.env.OPENAI_API_KEY
            });

            // Use the model name from config
            const modelName = this.config.modelName || this.config.model || 'gpt-3.5-turbo';

            this.queryFunction = async (prompt) => {
                const completion = await this.client.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: modelName,
                    temperature: this.config.temperature || 0.7,
                    max_tokens: this.config.maxTokens || 150
                });

                return {
                    response: completion.choices[0].message.content,
                    usage: completion.usage,
                    model: completion.model
                };
            };
        } catch (error) {
            console.error('Failed to initialize OpenAI:', error.message);
            throw error;
        }
    }

    /**
     * Initialize Anthropic client
     */
    async initializeAnthropic() {
        try {
            const Anthropic = require('@anthropic-ai/sdk');
            this.client = new Anthropic({
                apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY
            });

            this.queryFunction = async (prompt) => {
                const message = await this.client.messages.create({
                    model: this.config.model || 'claude-3-sonnet-20240229',
                    max_tokens: this.config.maxTokens || 150,
                    messages: [{ role: 'user', content: prompt }]
                });

                return {
                    response: message.content[0].text,
                    usage: message.usage,
                    model: message.model
                };
            };
        } catch (error) {
            console.error('Failed to initialize Anthropic:', error.message);
            throw error;
        }
    }

    /**
     * Initialize HuggingFace client
     */
    async initializeHuggingFace() {
        const apiUrl = this.config.target || 'https://api-inference.huggingface.co/models/';
        const model = this.config.model || 'gpt2';

        this.queryFunction = async (prompt) => {
            const response = await axios.post(
                `${apiUrl}${model}`,
                { inputs: prompt },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey || process.env.HUGGINGFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                response: response.data[0]?.generated_text || response.data,
                model: model
            };
        };
    }

    /**
     * Initialize local LLM (Ollama, LM Studio, etc.)
     */
    async initializeLocal() {
        const baseURL = this.config.target || 'http://localhost:11434';

        this.queryFunction = async (prompt) => {
            try {
                // Ollama format
                if (baseURL.includes('11434')) {
                    const response = await axios.post(
                        `${baseURL}/api/generate`,
                        {
                            model: this.config.model || 'llama2',
                            prompt: prompt,
                            stream: false
                        }
                    );

                    return {
                        response: response.data.response,
                        model: response.data.model
                    };
                }

                // LM Studio / OpenAI compatible format
                const response = await axios.post(
                    `${baseURL}/v1/chat/completions`,
                    {
                        messages: [{ role: 'user', content: prompt }],
                        model: this.config.model || 'local-model',
                        temperature: this.config.temperature || 0.7
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.apiKey || 'local'}`
                        }
                    }
                );

                return {
                    response: response.data.choices[0].message.content,
                    model: response.data.model
                };
            } catch (error) {
                console.error('Local LLM error:', error.message);
                throw error;
            }
        };
    }

    /**
     * Initialize Google client
     */
    async initializeGoogle() {
        const { providerConfig, modelName, apiKey } = this.config;

        this.queryFunction = async (prompt) => {
            const url = providerConfig.urlBuilder ?
                providerConfig.urlBuilder(modelName, apiKey) :
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const response = await axios.post(
                url,
                providerConfig.requestFormat(prompt, modelName, this.config, apiKey),
                { headers: providerConfig.headers(apiKey) }
            );

            return providerConfig.responseParser(response.data);
        };
    }

    /**
     * Initialize Azure client
     */
    async initializeAzure() {
        const { providerConfig, modelName, apiKey } = this.config;

        this.queryFunction = async (prompt) => {
            const url = providerConfig.urlBuilder(modelName, apiKey, this.config);
            const response = await axios.post(
                url,
                providerConfig.requestFormat(prompt, modelName, this.config),
                { headers: providerConfig.headers(apiKey) }
            );

            return providerConfig.responseParser(response.data);
        };
    }

    /**
     * Initialize Cohere client
     */
    async initializeCohere() {
        const { providerConfig, modelName, apiKey } = this.config;

        this.queryFunction = async (prompt) => {
            const response = await axios.post(
                providerConfig.endpoint,
                providerConfig.requestFormat(prompt, modelName, this.config),
                { headers: providerConfig.headers(apiKey) }
            );

            return providerConfig.responseParser(response.data);
        };
    }

    /**
     * Initialize Replicate client
     */
    async initializeReplicate() {
        const { providerConfig, modelName, apiKey } = this.config;

        this.queryFunction = async (prompt) => {
            const response = await axios.post(
                providerConfig.endpoint,
                providerConfig.requestFormat(prompt, modelName, this.config),
                { headers: providerConfig.headers(apiKey) }
            );

            return providerConfig.responseParser(response.data);
        };
    }

    /**
     * Initialize custom endpoint
     */
    async initializeCustom() {
        const baseURL = this.config.endpoint || this.config.target;

        if (!baseURL) {
            throw new Error('Custom endpoint requires a target URL');
        }

        this.queryFunction = async (prompt) => {
            try {
                const requestBody = this.config.requestFormat ?
                    this.config.requestFormat(prompt) :
                    { prompt: prompt };

                const headers = {
                    'Content-Type': 'application/json'
                };

                if (this.config.apiKey) {
                    headers['Authorization'] = `Bearer ${this.config.apiKey}`;
                }

                if (this.config.headers) {
                    Object.assign(headers, this.config.headers);
                }

                const response = await axios.post(
                    baseURL,
                    requestBody,
                    { headers }
                );

                // Extract response based on custom format
                let responseText;
                if (this.config.responseFormat) {
                    responseText = this.config.responseFormat(response.data);
                } else if (response.data.response) {
                    responseText = response.data.response;
                } else if (response.data.choices?.[0]?.message?.content) {
                    responseText = response.data.choices[0].message.content;
                } else if (response.data.text) {
                    responseText = response.data.text;
                } else if (typeof response.data === 'string') {
                    responseText = response.data;
                } else {
                    responseText = JSON.stringify(response.data);
                }

                return {
                    response: responseText,
                    raw: response.data
                };
            } catch (error) {
                console.error('Custom endpoint error:', error.message);
                throw error;
            }
        };
    }

    /**
     * Query the LLM
     */
    async query(prompt, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const startTime = Date.now();

        try {
            this.stats.totalQueries++;

            // Add security testing markers if specified
            if (options.securityTest) {
                prompt = this.wrapForSecurityTest(prompt, options.securityTest);
            }

            const result = await this.queryFunction(prompt);

            // Update statistics
            const responseTime = Date.now() - startTime;
            this.updateStats(result, responseTime);

            return {
                ...result,
                responseTime,
                timestamp: new Date().toISOString(),
                promptLength: prompt.length
            };

        } catch (error) {
            this.stats.errors++;
            throw new Error(`LLM query failed: ${error.message}`);
        }
    }

    /**
     * Batch query for efficiency
     */
    async batchQuery(prompts, options = {}) {
        const results = [];

        // Process in parallel if supported
        if (this.config.parallel !== false && prompts.length > 1) {
            const batchSize = this.config.batchSize || 5;

            for (let i = 0; i < prompts.length; i += batchSize) {
                const batch = prompts.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(prompt => this.query(prompt, options))
                );
                results.push(...batchResults);

                // Rate limiting between batches
                if (i + batchSize < prompts.length) {
                    await this.sleep(this.config.batchDelay || 1000);
                }
            }
        } else {
            // Sequential processing
            for (const prompt of prompts) {
                results.push(await this.query(prompt, options));

                // Rate limiting
                if (this.config.rateLimit) {
                    await this.sleep(60000 / this.config.rateLimit);
                }
            }
        }

        return results;
    }

    /**
     * Wrap prompt for security testing
     */
    wrapForSecurityTest(prompt, testType) {
        // Add markers that help identify if the test succeeded
        const markers = {
            promptInjection: {
                prefix: '',
                suffix: '\n[END_TEST]'
            },
            jailbreak: {
                prefix: 'TEST_ID:' + Date.now() + '\n',
                suffix: ''
            },
            dataLeakage: {
                prefix: '',
                suffix: '\n[SENSITIVE_DATA_TEST]'
            }
        };

        const marker = markers[testType] || { prefix: '', suffix: '' };
        return marker.prefix + prompt + marker.suffix;
    }

    /**
     * Update statistics
     */
    updateStats(result, responseTime) {
        if (result.usage) {
            this.stats.totalTokens += (result.usage.total_tokens || 0);

            // Estimate cost (OpenAI pricing as example)
            if (this.type === 'openai') {
                const inputCost = (result.usage.prompt_tokens || 0) * 0.0005 / 1000;
                const outputCost = (result.usage.completion_tokens || 0) * 0.0015 / 1000;
                this.stats.totalCost += (inputCost + outputCost);
            }
        }

        // Update average response time
        const alpha = 0.1; // Smoothing factor
        this.stats.avgResponseTime =
            (1 - alpha) * this.stats.avgResponseTime + alpha * responseTime;
    }

    /**
     * Test connection to LLM
     */
    async testConnection() {
        try {
            const result = await this.query('Hello, please respond with "OK" if you receive this.');

            // Get the proper provider name for display
            const providerName = this.config.providerName ||
                               this.config.provider ||
                               this.type ||
                               'unknown';

            return {
                success: true,
                type: providerName,
                model: this.config.modelName || this.config.model,
                response: result.response,
                responseTime: result.responseTime
            };
        } catch (error) {
            return {
                success: false,
                type: this.config.providerName || this.config.provider || this.type,
                error: error.message
            };
        }
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            type: this.type,
            initialized: this.initialized,
            averageCostPerQuery: this.stats.totalQueries > 0 ?
                this.stats.totalCost / this.stats.totalQueries : 0
        };
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = LLMConnector;