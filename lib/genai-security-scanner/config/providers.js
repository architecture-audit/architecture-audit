/**
 * LLM Provider Configurations
 * Pre-configured settings for popular LLM providers
 */

const providers = {
    openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: {
            'gpt-4': {
                name: 'GPT-4',
                maxTokens: 8192,
                costPer1kInput: 0.03,
                costPer1kOutput: 0.06
            },
            'gpt-4-turbo': {
                name: 'GPT-4 Turbo',
                maxTokens: 128000,
                costPer1kInput: 0.01,
                costPer1kOutput: 0.03
            },
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                maxTokens: 16385,
                costPer1kInput: 0.0005,
                costPer1kOutput: 0.0015,
                default: true
            },
            'gpt-3.5-turbo-0125': {
                name: 'GPT-3.5 Turbo Latest',
                maxTokens: 16385,
                costPer1kInput: 0.0005,
                costPer1kOutput: 0.0015
            }
        },
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}) => ({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 150,
            top_p: options.topP || 1,
            frequency_penalty: options.frequencyPenalty || 0,
            presence_penalty: options.presencePenalty || 0
        }),
        responseParser: (data) => ({
            response: data.choices[0].message.content,
            usage: data.usage,
            model: data.model,
            finishReason: data.choices[0].finish_reason
        })
    },

    anthropic: {
        name: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: {
            'claude-3-opus-20240229': {
                name: 'Claude 3 Opus',
                maxTokens: 200000,
                costPer1kInput: 0.015,
                costPer1kOutput: 0.075
            },
            'claude-3-sonnet-20240229': {
                name: 'Claude 3 Sonnet',
                maxTokens: 200000,
                costPer1kInput: 0.003,
                costPer1kOutput: 0.015,
                default: true
            },
            'claude-3-haiku-20240307': {
                name: 'Claude 3 Haiku',
                maxTokens: 200000,
                costPer1kInput: 0.00025,
                costPer1kOutput: 0.00125
            },
            'claude-2.1': {
                name: 'Claude 2.1',
                maxTokens: 100000,
                costPer1kInput: 0.008,
                costPer1kOutput: 0.024
            }
        },
        headers: (apiKey) => ({
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}) => ({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 150,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 1
        }),
        responseParser: (data) => ({
            response: data.content[0].text,
            usage: data.usage,
            model: data.model,
            stopReason: data.stop_reason
        })
    },

    google: {
        name: 'Google AI',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
        models: {
            'gemini-pro': {
                name: 'Gemini Pro',
                maxTokens: 32768,
                costPer1kInput: 0.00025,
                costPer1kOutput: 0.0005,
                default: true
            },
            'gemini-pro-vision': {
                name: 'Gemini Pro Vision',
                maxTokens: 16384,
                costPer1kInput: 0.00025,
                costPer1kOutput: 0.0005
            },
            'palm-2': {
                name: 'PaLM 2',
                maxTokens: 8192,
                costPer1kInput: 0.0002,
                costPer1kOutput: 0.0004
            }
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}, apiKey) => ({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 150,
                topP: options.topP || 1
            }
        }),
        responseParser: (data) => ({
            response: data.candidates[0].content.parts[0].text,
            model: 'gemini-pro',
            finishReason: data.candidates[0].finishReason
        }),
        urlBuilder: (model, apiKey) =>
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    },

    cohere: {
        name: 'Cohere',
        endpoint: 'https://api.cohere.ai/v1/generate',
        models: {
            'command': {
                name: 'Command',
                maxTokens: 4096,
                costPer1kInput: 0.0015,
                costPer1kOutput: 0.002,
                default: true
            },
            'command-light': {
                name: 'Command Light',
                maxTokens: 4096,
                costPer1kInput: 0.00015,
                costPer1kOutput: 0.0006
            },
            'command-nightly': {
                name: 'Command Nightly',
                maxTokens: 4096,
                costPer1kInput: 0.0015,
                costPer1kOutput: 0.002
            }
        },
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}) => ({
            model: model,
            prompt: prompt,
            max_tokens: options.maxTokens || 150,
            temperature: options.temperature || 0.7,
            p: options.topP || 0.75
        }),
        responseParser: (data) => ({
            response: data.generations[0].text,
            model: data.model
        })
    },

    huggingface: {
        name: 'HuggingFace',
        endpoint: 'https://api-inference.huggingface.co/models/',
        models: {
            'mistralai/Mistral-7B-Instruct-v0.2': {
                name: 'Mistral 7B Instruct',
                maxTokens: 32768,
                free: true,
                default: true
            },
            'meta-llama/Llama-2-70b-chat-hf': {
                name: 'Llama 2 70B Chat',
                maxTokens: 4096,
                free: true
            },
            'google/flan-t5-xxl': {
                name: 'FLAN-T5 XXL',
                maxTokens: 512,
                free: true
            },
            'bigscience/bloom': {
                name: 'BLOOM 176B',
                maxTokens: 2048,
                free: true
            }
        },
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}) => ({
            inputs: prompt,
            parameters: {
                max_new_tokens: options.maxTokens || 150,
                temperature: options.temperature || 0.7,
                top_p: options.topP || 0.95,
                do_sample: true
            }
        }),
        responseParser: (data) => ({
            response: Array.isArray(data) ? data[0].generated_text : data.generated_text || data,
            model: 'huggingface'
        }),
        urlBuilder: (model) => `https://api-inference.huggingface.co/models/${model}`
    },

    ollama: {
        name: 'Ollama (Local)',
        endpoint: 'http://localhost:11434',
        models: {
            'llama2': {
                name: 'Llama 2',
                maxTokens: 4096,
                free: true,
                default: true
            },
            'llama2:13b': {
                name: 'Llama 2 13B',
                maxTokens: 4096,
                free: true
            },
            'llama2:70b': {
                name: 'Llama 2 70B',
                maxTokens: 4096,
                free: true
            },
            'mistral': {
                name: 'Mistral',
                maxTokens: 32768,
                free: true
            },
            'codellama': {
                name: 'Code Llama',
                maxTokens: 16384,
                free: true
            },
            'mixtral': {
                name: 'Mixtral',
                maxTokens: 32768,
                free: true
            },
            'phi': {
                name: 'Phi-2',
                maxTokens: 2048,
                free: true
            }
        },
        headers: () => ({
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}) => ({
            model: model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                top_p: options.topP || 0.9,
                num_predict: options.maxTokens || 150
            }
        }),
        responseParser: (data) => ({
            response: data.response,
            model: data.model,
            totalDuration: data.total_duration,
            loadDuration: data.load_duration
        }),
        urlBuilder: () => 'http://localhost:11434/api/generate'
    },

    azure: {
        name: 'Azure OpenAI',
        endpoint: 'https://{resource}.openai.azure.com/openai/deployments/{deployment}/chat/completions',
        models: {
            'gpt-4': {
                name: 'GPT-4 (Azure)',
                maxTokens: 8192,
                costPer1kInput: 0.03,
                costPer1kOutput: 0.06
            },
            'gpt-35-turbo': {
                name: 'GPT-3.5 Turbo (Azure)',
                maxTokens: 4096,
                costPer1kInput: 0.0015,
                costPer1kOutput: 0.002,
                default: true
            }
        },
        headers: (apiKey) => ({
            'api-key': apiKey,
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}) => ({
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 150,
            top_p: options.topP || 1
        }),
        responseParser: (data) => ({
            response: data.choices[0].message.content,
            usage: data.usage,
            model: data.model
        }),
        urlBuilder: (model, apiKey, options) => {
            const resource = options.azureResource;
            const deployment = options.azureDeployment || model;
            const apiVersion = options.azureApiVersion || '2023-12-01-preview';
            return `https://${resource}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        }
    },

    replicate: {
        name: 'Replicate',
        endpoint: 'https://api.replicate.com/v1/predictions',
        models: {
            'meta/llama-2-70b-chat': {
                name: 'Llama 2 70B',
                maxTokens: 4096,
                costPer1kInput: 0.00065,
                costPer1kOutput: 0.00275,
                default: true
            },
            'mistralai/mistral-7b-instruct': {
                name: 'Mistral 7B',
                maxTokens: 32768,
                costPer1kInput: 0.00005,
                costPer1kOutput: 0.00025
            }
        },
        headers: (apiKey) => ({
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        }),
        requestFormat: (prompt, model, options = {}) => ({
            version: model,
            input: {
                prompt: prompt,
                max_new_tokens: options.maxTokens || 150,
                temperature: options.temperature || 0.7,
                top_p: options.topP || 0.9
            }
        }),
        responseParser: (data) => ({
            response: data.output,
            model: data.model,
            status: data.status
        })
    }
};

// Helper function to get provider configuration
function getProviderConfig(providerName) {
    const provider = providers[providerName.toLowerCase()];
    if (!provider) {
        throw new Error(`Unknown provider: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
    }
    return provider;
}

// Helper function to get model configuration
function getModelConfig(providerName, modelName) {
    const provider = getProviderConfig(providerName);

    // If no model specified, use default
    if (!modelName) {
        const defaultModel = Object.entries(provider.models).find(([_, config]) => config.default);
        if (defaultModel) {
            return { name: defaultModel[0], config: defaultModel[1] };
        }
        // If no default, use first model
        const firstModel = Object.entries(provider.models)[0];
        return { name: firstModel[0], config: firstModel[1] };
    }

    const model = provider.models[modelName];
    if (!model) {
        throw new Error(`Unknown model: ${modelName}. Available models for ${providerName}: ${Object.keys(provider.models).join(', ')}`);
    }

    return { name: modelName, config: model };
}

// Helper function to list all available models
function listAvailableModels() {
    const modelList = {};

    for (const [providerName, provider] of Object.entries(providers)) {
        modelList[providerName] = {
            name: provider.name,
            models: Object.entries(provider.models).map(([modelKey, model]) => ({
                key: modelKey,
                name: model.name,
                maxTokens: model.maxTokens,
                free: model.free || false,
                default: model.default || false,
                cost: model.costPer1kInput ?
                    `$${model.costPer1kInput}/$${model.costPer1kOutput} per 1k tokens` :
                    'Free'
            }))
        };
    }

    return modelList;
}

module.exports = {
    providers,
    getProviderConfig,
    getModelConfig,
    listAvailableModels
};