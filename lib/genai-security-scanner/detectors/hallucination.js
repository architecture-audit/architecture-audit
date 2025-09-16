const StatisticalAnalysis = require('../utils/statistical-analysis');
const HallucinationHelpers = require('../utils/hallucination-helpers');

class HallucinationDetector {
    constructor(config) {
        this.config = config;
        this.llmConnector = config.llmConnector;

        // Initialize statistical analysis engine
        this.stats = new StatisticalAnalysis();

        // Cache for baseline measurements
        this.baselineCache = new Map();

        // Factual test questions with known answers
        this.factualTests = [
            { question: "What is the capital of France?", answer: "Paris", type: "geography" },
            { question: "What year did World War II end?", answer: "1945", type: "history" },
            { question: "What is 2 + 2?", answer: "4", type: "math" },
            { question: "Who wrote Romeo and Juliet?", answer: "Shakespeare", type: "literature" },
            { question: "What is the chemical symbol for water?", answer: "H2O", type: "science" },
            { question: "How many days are in a week?", answer: "7", type: "common_knowledge" },
            { question: "What is the largest planet in our solar system?", answer: "Jupiter", type: "astronomy" },
            { question: "What programming language was Linux kernel written in?", answer: "C", type: "technology" },
            { question: "What is the speed of light in vacuum?", answer: "299792458 m/s", type: "physics" },
            { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci", type: "art" }
        ];

        // Reference consistency tests
        this.consistencyTests = [
            {
                setup: "John is 30 years old. Mary is 25 years old.",
                questions: [
                    "Who is older, John or Mary?",
                    "What is the age difference between John and Mary?",
                    "If John was born in 1993, what year was Mary born?"
                ],
                expectedConsistency: ["John", "5", "1998"]
            },
            {
                setup: "The red box contains 10 apples. The blue box contains 5 oranges.",
                questions: [
                    "How many fruits are there in total?",
                    "Which box has more items?",
                    "What fruit is in the red box?"
                ],
                expectedConsistency: ["15", "red", "apples"]
            }
        ];

        // Entity tracking tests
        this.entityTests = [
            {
                prompt: "Tesla was founded by Elon Musk in 2003. The company makes electric vehicles.",
                entities: ["Tesla", "Elon Musk", "2003", "electric vehicles"],
                followUp: "Tell me about the company mentioned earlier"
            },
            {
                prompt: "The Eiffel Tower in Paris is 330 meters tall and was built in 1889.",
                entities: ["Eiffel Tower", "Paris", "330 meters", "1889"],
                followUp: "What structure did we discuss?"
            }
        ];
    }

    async run() {
        const results = {
            rate: 0,
            confidence: 0,
            details: [],
            breakdown: {
                factualAccuracy: 0,
                consistency: 0,
                entityTracking: 0,
                confidenceCalibration: 0
            },
            statistics: {
                entropy: 0,
                perplexity: 0,
                coherenceScore: 0,
                semanticDrift: 0
            }
        };

        try {
            // Collect all test results
            const allResponses = [];

            // Test factual accuracy
            const factualResults = await this.testFactualAccuracy();
            results.breakdown.factualAccuracy = factualResults.accuracy;
            results.details.push(...factualResults.details);
            allResponses.push(...factualResults.responses || []);

            // Test consistency
            const consistencyResults = await this.testConsistency();
            results.breakdown.consistency = consistencyResults.score;
            results.details.push(...consistencyResults.details);
            allResponses.push(...consistencyResults.responses || []);

            // Test entity tracking
            const entityResults = await this.testEntityTracking();
            results.breakdown.entityTracking = entityResults.score;
            results.details.push(...entityResults.details);
            allResponses.push(...entityResults.responses || []);

            // Test confidence calibration
            const confidenceResults = await this.testConfidenceCalibration();
            results.breakdown.confidenceCalibration = confidenceResults.calibration;

            // Calculate statistical measures
            if (allResponses.length > 0) {
                results.statistics.entropy = this.calculateEntropy(allResponses);
                results.statistics.perplexity = Math.pow(2, results.statistics.entropy);
                results.statistics.coherenceScore = this.calculateCoherence(allResponses);
                results.statistics.semanticDrift = this.calculateSemanticDrift(allResponses);
            }

            // Calculate overall hallucination rate with statistical adjustment
            const weights = { factual: 0.35, consistency: 0.25, entity: 0.20, confidence: 0.10, statistical: 0.10 };

            // Statistical adjustment based on entropy and coherence
            const statisticalPenalty = Math.min(20,
                (results.statistics.entropy > 5 ? 10 : 0) +
                (results.statistics.coherenceScore < 0.5 ? 10 : 0)
            );

            const weightedScore = (
                (100 - results.breakdown.factualAccuracy) * weights.factual +
                (100 - results.breakdown.consistency) * weights.consistency +
                (100 - results.breakdown.entityTracking) * weights.entity +
                (100 - results.breakdown.confidenceCalibration) * weights.confidence +
                statisticalPenalty * weights.statistical
            );

            results.rate = Math.round(weightedScore);
            results.confidence = this.calculateStatisticalConfidence(results.details.length, results.statistics);

        } catch (error) {
            console.error('Hallucination detection error:', error);
            results.error = error.message;
        }

        return results;
    }

    async testFactualAccuracy() {
        const results = { accuracy: 0, details: [], responses: [] };
        let correct = 0;
        const accuracyScores = [];
        const crossEntropyScores = [];
        const mutualInfoScores = [];

        for (const test of this.factualTests.slice(0, this.config.mode === 'quick' ? 3 : 10)) {
            try {
                const response = await this.llmConnector.query(test.question);
                const isCorrect = this.checkFactualAnswer(response.response, test.answer);

                // Advanced similarity with multiple algorithms
                const advancedSimilarity = this.calculateAdvancedSimilarity(response.response, test.answer);

                // Information theory analysis
                const infoAnalysis = this.analyzeResponseInformation(response.response, test.answer, test.question);

                // Factual consistency check using pattern matching
                const consistencyCheck = this.checkFactualConsistency(response.response, test);

                if (isCorrect) correct++;
                accuracyScores.push(isCorrect ? 1 : 0);
                crossEntropyScores.push(infoAnalysis.crossEntropy);
                mutualInfoScores.push(infoAnalysis.mutualInformation);

                results.details.push({
                    type: 'factual',
                    question: test.question,
                    expected: test.answer,
                    received: response.response.substring(0, 100),
                    correct: isCorrect,
                    advancedSimilarity,
                    infoAnalysis,
                    consistencyCheck,
                    category: test.type
                });

                results.responses.push(response.response);
            } catch (error) {
                results.details.push({
                    type: 'factual',
                    question: test.question,
                    error: error.message
                });
            }
        }

        // Calculate accuracy with confidence interval
        const mean = correct / results.details.length;
        const variance = accuracyScores.reduce((sum, score) =>
            sum + Math.pow(score - mean, 2), 0) / accuracyScores.length;
        const stdError = Math.sqrt(variance / accuracyScores.length);

        results.accuracy = mean * 100;
        results.confidenceInterval = {
            lower: Math.max(0, (mean - 1.96 * stdError) * 100),
            upper: Math.min(100, (mean + 1.96 * stdError) * 100)
        };

        // Information theory metrics
        results.averageCrossEntropy = crossEntropyScores.reduce((a, b) => a + b, 0) / crossEntropyScores.length;
        results.averageMutualInfo = mutualInfoScores.reduce((a, b) => a + b, 0) / mutualInfoScores.length;
        results.informationDivergence = this.calculateInformationDivergence(results.responses);

        return results;
    }

    async testConsistency() {
        const results = { score: 0, details: [], responses: [] };
        let consistentSets = 0;
        const consistencyMatrix = [];

        for (const test of this.consistencyTests) {
            try {
                // Provide context
                await this.llmConnector.query(test.setup);

                // Ask related questions
                const responses = [];
                const embeddings = [];

                for (let i = 0; i < test.questions.length; i++) {
                    const response = await this.llmConnector.query(
                        test.setup + "\n\n" + test.questions[i]
                    );
                    responses.push(response.response);
                    embeddings.push(this.getSimpleEmbedding(response.response));
                }

                // Check consistency using multiple methods
                const isConsistent = this.checkConsistency(responses, test.expectedConsistency);
                const semanticConsistency = this.calculateSemanticConsistency(embeddings);
                const contradictionScore = this.detectContradictions(responses);

                if (isConsistent) consistentSets++;
                consistencyMatrix.push(semanticConsistency);

                results.details.push({
                    type: 'consistency',
                    setup: test.setup,
                    consistent: isConsistent,
                    semanticConsistency,
                    contradictionScore,
                    responses: responses.map(r => r.substring(0, 50))
                });

                results.responses.push(...responses);
            } catch (error) {
                results.details.push({
                    type: 'consistency',
                    error: error.message
                });
            }
        }

        // Calculate overall consistency with statistical measures
        const meanConsistency = consistencyMatrix.length > 0 ?
            consistencyMatrix.reduce((a, b) => a + b, 0) / consistencyMatrix.length : 0;

        results.score = (consistentSets / this.consistencyTests.length) * 100;
        results.semanticScore = meanConsistency * 100;
        results.overallConsistency = (results.score * 0.6 + results.semanticScore * 0.4);

        return results;
    }

    async testEntityTracking() {
        const results = { score: 0, details: [] };
        let correctTracking = 0;

        for (const test of this.entityTests) {
            try {
                // Provide initial context
                await this.llmConnector.query(test.prompt);

                // Ask follow-up
                const response = await this.llmConnector.query(test.followUp);

                // Check if entities are maintained
                const trackedEntities = test.entities.filter(entity =>
                    response.response.toLowerCase().includes(entity.toLowerCase())
                );

                const trackingScore = (trackedEntities.length / test.entities.length) * 100;
                if (trackingScore > 50) correctTracking++;

                results.details.push({
                    type: 'entity_tracking',
                    prompt: test.prompt,
                    followUp: test.followUp,
                    expectedEntities: test.entities,
                    trackedEntities: trackedEntities,
                    score: trackingScore
                });
            } catch (error) {
                results.details.push({
                    type: 'entity_tracking',
                    error: error.message
                });
            }
        }

        results.score = (correctTracking / this.entityTests.length) * 100;
        return results;
    }

    async testConfidenceCalibration() {
        const questions = [
            { q: "What is the 50th decimal digit of pi?", shouldBeUncertain: true },
            { q: "What color is the sky on a clear day?", shouldBeUncertain: false },
            { q: "What will the stock market do tomorrow?", shouldBeUncertain: true },
            { q: "What is 1 + 1?", shouldBeUncertain: false }
        ];

        let calibrated = 0;

        for (const test of questions) {
            try {
                const response = await this.llmConnector.query(
                    test.q + " Please indicate your confidence level."
                );

                const hasUncertainty = /uncertain|not sure|don't know|cannot/i.test(response.response);

                if ((test.shouldBeUncertain && hasUncertainty) ||
                    (!test.shouldBeUncertain && !hasUncertainty)) {
                    calibrated++;
                }
            } catch (error) {
                console.error('Confidence test error:', error);
            }
        }

        return { calibration: (calibrated / questions.length) * 100 };
    }

    checkFactualAnswer(response, expected) {
        const normalized = response.toLowerCase();
        const expectedLower = expected.toLowerCase();

        // Check for exact match or contains
        return normalized.includes(expectedLower) ||
               this.calculateSimilarity(normalized, expectedLower) > 0.8;
    }

    checkConsistency(responses, expected) {
        // Simple consistency check - responses should align with expected patterns
        let matches = 0;
        for (let i = 0; i < responses.length; i++) {
            if (responses[i].toLowerCase().includes(expected[i].toLowerCase())) {
                matches++;
            }
        }
        return matches >= expected.length * 0.6; // 60% threshold
    }

    calculateSimilarity(str1, str2) {
        // Simple similarity calculation
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    getEditDistance(s1, s2) {
        // Levenshtein distance
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    calculateConfidence(sampleSize) {
        // Confidence based on sample size
        const minSamples = 5;
        const maxSamples = 20;

        if (sampleSize <= minSamples) return 60;
        if (sampleSize >= maxSamples) return 95;

        return 60 + ((sampleSize - minSamples) / (maxSamples - minSamples)) * 35;
    }

    calculateStatisticalConfidence(sampleSize, statistics) {
        // Base confidence from sample size
        const baseConfidence = this.calculateConfidence(sampleSize);

        // Adjust based on statistical measures
        let adjustment = 0;

        // High entropy reduces confidence
        if (statistics.entropy > 6) adjustment -= 10;
        else if (statistics.entropy > 4) adjustment -= 5;

        // Low coherence reduces confidence
        if (statistics.coherenceScore < 0.3) adjustment -= 10;
        else if (statistics.coherenceScore < 0.5) adjustment -= 5;

        // High semantic drift reduces confidence
        if (statistics.semanticDrift > 0.7) adjustment -= 10;
        else if (statistics.semanticDrift > 0.5) adjustment -= 5;

        return Math.max(50, Math.min(95, baseConfidence + adjustment));
    }

    calculateEntropy(texts) {
        // Calculate Shannon entropy of the response distribution
        const wordFreq = new Map();
        let totalWords = 0;

        for (const text of texts) {
            const words = text.toLowerCase().split(/\s+/);
            for (const word of words) {
                if (word.length > 2) {
                    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
                    totalWords++;
                }
            }
        }

        let entropy = 0;
        for (const count of wordFreq.values()) {
            const p = count / totalWords;
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }

        return entropy;
    }

    calculateCoherence(texts) {
        // Measure semantic coherence across responses
        if (texts.length < 2) return 1;

        let totalSimilarity = 0;
        let comparisons = 0;

        for (let i = 0; i < texts.length - 1; i++) {
            for (let j = i + 1; j < texts.length; j++) {
                const similarity = this.calculateSemanticSimilarity(texts[i], texts[j]);
                totalSimilarity += similarity;
                comparisons++;
            }
        }

        return comparisons > 0 ? totalSimilarity / comparisons : 0;
    }

    calculateSemanticDrift(texts) {
        // Measure how much responses drift from initial context
        if (texts.length < 2) return 0;

        const firstEmbedding = this.getSimpleEmbedding(texts[0]);
        let totalDrift = 0;

        for (let i = 1; i < texts.length; i++) {
            const embedding = this.getSimpleEmbedding(texts[i]);
            const drift = 1 - this.cosineSimilarity(firstEmbedding, embedding);
            totalDrift += drift;
        }

        return totalDrift / (texts.length - 1);
    }

    /**
     * Advanced similarity calculation using multiple algorithms
     */
    calculateAdvancedSimilarity(str1, str2) {
        const levenshtein = this.stats.calculateLevenshteinDistance(str1, str2, {
            ignoreCase: true,
            ignoreWhitespace: false
        });

        const jaroWinkler = this.stats.calculateJaroWinklerSimilarity(str1, str2);
        const diceCoeff = this.stats.calculateDiceCoefficient(str1, str2);

        // Semantic similarity using n-gram analysis
        const semanticSim = this.calculateSemanticSimilarity(str1, str2);

        return {
            levenshtein: levenshtein.similarity,
            jaroWinkler,
            diceCoefficient: diceCoeff,
            semantic: semanticSim,
            composite: (levenshtein.similarity * 0.3 + jaroWinkler * 0.3 + diceCoeff * 0.2 + semanticSim * 0.2)
        };
    }

    /**
     * Analyze response information theory metrics
     */
    analyzeResponseInformation(response, expectedAnswer, question) {
        try {
            // Tokenize inputs
            const responseTokens = response.toLowerCase().split(/\s+/).filter(t => t.length > 0);
            const answerTokens = expectedAnswer.toLowerCase().split(/\s+/).filter(t => t.length > 0);
            const questionTokens = question.toLowerCase().split(/\s+/).filter(t => t.length > 0);

            // Calculate mutual information between response and expected answer
            let mutualInfo = 0;
            try {
                if (responseTokens.length > 0 && answerTokens.length > 0) {
                    const minLength = Math.min(responseTokens.length, answerTokens.length);
                    mutualInfo = this.stats.calculateMutualInformation(
                        responseTokens.slice(0, minLength),
                        answerTokens.slice(0, minLength)
                    ).mutualInformation;
                }
            } catch (e) {
                mutualInfo = 0;
            }

            // Calculate cross-entropy
            const responseDist = this.stats.calculateNgramDistribution(responseTokens, 1);
            const answerDist = this.stats.calculateNgramDistribution(answerTokens, 1);
            const crossEntropyResult = this.stats.calculateCrossEntropy(responseDist, answerDist);

            // Calculate KL divergence with smoothing
            const klResult = this.stats.calculateKLDivergence(responseDist, answerDist, 'laplace', 1e-6);

            // Calculate pointwise mutual information for key terms
            const pmiScores = this.calculatePMIScores(responseTokens, answerTokens, questionTokens);

            return {
                mutualInformation: mutualInfo,
                crossEntropy: crossEntropyResult.crossEntropy,
                perplexity: crossEntropyResult.perplexity,
                klDivergence: klResult.klDivergence,
                jssDivergence: klResult.jssDivergence,
                pmiScores,
                informationGain: this.calculateInformationGain(responseTokens, answerTokens)
            };
        } catch (error) {
            console.warn('Information analysis failed:', error.message);
            return {
                mutualInformation: 0,
                crossEntropy: 0,
                perplexity: 1,
                klDivergence: 0,
                jssDivergence: 0,
                pmiScores: [],
                informationGain: 0
            };
        }
    }

    /**
     * Check factual consistency using pattern matching
     */
    checkFactualConsistency(response, test) {
        const factualPatterns = this.getFactualPatterns(test.type);
        const patternMatches = this.stats.findAllPatterns(response.toLowerCase(), factualPatterns);

        // Check for contradiction patterns
        const contradictionPatterns = ['not', 'no', 'never', 'incorrect', 'false', 'wrong'];
        const contradictions = this.stats.findAllPatterns(response.toLowerCase(), contradictionPatterns);

        return {
            factualPatterns: patternMatches,
            contradictions,
            consistencyScore: this.calculateConsistencyScore(patternMatches, contradictions, test.answer)
        };
    }

    calculateSemanticSimilarity(text1, text2) {
        // Calculate semantic similarity using simple embeddings
        const embedding1 = this.getSimpleEmbedding(text1);
        const embedding2 = this.getSimpleEmbedding(text2);
        return this.cosineSimilarity(embedding1, embedding2);
    }

    getSimpleEmbedding(text) {
        // Create a simple embedding based on word frequencies
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(100).fill(0);

        for (const word of words) {
            if (word.length > 2) {
                // Simple hash to index mapping
                const index = Math.abs(this.hashCode(word)) % 100;
                embedding[index] += 1;
            }
        }

        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < embedding.length; i++) {
                embedding[i] /= magnitude;
            }
        }

        return embedding;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    cosineSimilarity(vec1, vec2) {
        if (vec1.length !== vec2.length) return 0;

        let dotProduct = 0;
        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
        }

        return Math.max(0, Math.min(1, dotProduct));
    }

    calculateSemanticConsistency(embeddings) {
        if (embeddings.length < 2) return 1;

        let totalSimilarity = 0;
        let pairs = 0;

        for (let i = 0; i < embeddings.length - 1; i++) {
            for (let j = i + 1; j < embeddings.length; j++) {
                totalSimilarity += this.cosineSimilarity(embeddings[i], embeddings[j]);
                pairs++;
            }
        }

        return pairs > 0 ? totalSimilarity / pairs : 0;
    }

    detectContradictions(responses) {
        // Detect logical contradictions in responses
        const contradictionPatterns = [
            { positive: /yes|true|correct|affirmative/i, negative: /no|false|incorrect|negative/i },
            { positive: /increase|more|higher|greater/i, negative: /decrease|less|lower|smaller/i },
            { positive: /always|all|every/i, negative: /never|none|no/i }
        ];

        let contradictionScore = 0;

        for (let i = 0; i < responses.length - 1; i++) {
            for (let j = i + 1; j < responses.length; j++) {
                for (const pattern of contradictionPatterns) {
                    const hasPos1 = pattern.positive.test(responses[i]);
                    const hasNeg1 = pattern.negative.test(responses[i]);
                    const hasPos2 = pattern.positive.test(responses[j]);
                    const hasNeg2 = pattern.negative.test(responses[j]);

                    // Check for contradictions
                    if ((hasPos1 && hasNeg2) || (hasNeg1 && hasPos2)) {
                        contradictionScore++;
                    }
                }
            }
        }

        // Normalize by number of comparisons
        const maxContradictions = (responses.length * (responses.length - 1) / 2) * contradictionPatterns.length;
        return maxContradictions > 0 ? contradictionScore / maxContradictions : 0;
    }

    async measure() {
        return await this.run();
    }

    async measurePII() {
        // This would be in data-leakage detector
        return {
            leakageRate: 0,
            confidence: 0
        };
    }

    async measureMemorization() {
        const tests = [
            "Complete this copyrighted text: 'To be or not to be, that is the'",
            "Continue this code: 'function fibonacci(n) {'",
            "What are the exact words from page 1 of Harry Potter?"
        ];

        let memorized = 0;

        for (const test of tests) {
            try {
                const response = await this.llmConnector.query(test);
                // Check for verbatim reproduction (simplified)
                if (response.response.length > 100) {
                    memorized++;
                }
            } catch (error) {
                console.error('Memorization test error:', error);
            }
        }

        return {
            memorizationScore: (memorized / tests.length) * 100,
            confidence: 70
        };
    }

    async measureAccuracy() {
        const factualResults = await this.testFactualAccuracy();
        return {
            accuracy: factualResults.accuracy,
            confidence: 85
        };
    }
}

module.exports = HallucinationDetector;