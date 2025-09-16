/**
 * Statistical Analysis Utilities
 * Advanced pattern matching and information theory calculations for GenAI security scanning
 */

const AhoCorasick = require('aho-corasick');
const { distance } = require('ml-distance');
const natural = require('natural');
const { Matrix } = require('ml-matrix');
const ss = require('simple-statistics');
const math = require('mathjs');

class StatisticalAnalysis {
    constructor() {
        // Initialize pattern matcher for efficient multi-pattern matching
        this.patternMatcher = null;
        this.compiledPatterns = new Map();

        // Cache for computationally expensive operations
        this.cache = new Map();

        // Initialize tokenizers
        this.wordTokenizer = new natural.WordTokenizer();
        this.sentenceTokenizer = new natural.SentenceTokenizer();
    }

    /**
     * Phase 2: Pattern Matching Algorithms
     */

    /**
     * Initialize Aho-Corasick automaton for efficient multi-pattern matching
     */
    initializePatternMatcher(patterns) {
        const cacheKey = 'aho_corasick_' + patterns.sort().join('|');

        if (this.compiledPatterns.has(cacheKey)) {
            this.patternMatcher = this.compiledPatterns.get(cacheKey);
            return;
        }

        const ac = new AhoCorasick(patterns);
        this.patternMatcher = ac;
        this.compiledPatterns.set(cacheKey, ac);
    }

    /**
     * Efficient multi-pattern matching using Aho-Corasick
     */
    findAllPatterns(text, patterns) {
        if (!this.patternMatcher) {
            this.initializePatternMatcher(patterns);
        }

        const results = this.patternMatcher.search(text.toLowerCase());

        // Check if results is an array, if not convert it
        const resultsArray = Array.isArray(results) ? results : (results || []);

        return resultsArray.map(result => ({
            pattern: result[1],
            position: result[0],
            length: result[1].length,
            context: this.extractContext(text, result[0], result[1].length)
        }));
    }

    /**
     * Advanced Levenshtein distance with additional metrics
     */
    calculateLevenshteinDistance(str1, str2, options = {}) {
        const {
            ignoreCase = true,
            ignoreWhitespace = false,
            substitutionCost = 1,
            insertionCost = 1,
            deletionCost = 1
        } = options;

        let s1 = str1;
        let s2 = str2;

        if (ignoreCase) {
            s1 = s1.toLowerCase();
            s2 = s2.toLowerCase();
        }

        if (ignoreWhitespace) {
            s1 = s1.replace(/\s+/g, '');
            s2 = s2.replace(/\s+/g, '');
        }

        // Use ml-distance library for weighted Levenshtein
        const dist = distance.levenshtein(s1, s2, {
            substitution: substitutionCost,
            insertion: insertionCost,
            deletion: deletionCost
        });

        const maxLen = Math.max(s1.length, s2.length);
        const similarity = maxLen > 0 ? 1 - (dist / maxLen) : 1;

        return {
            distance: dist,
            similarity: similarity,
            normalizedDistance: maxLen > 0 ? dist / maxLen : 0,
            maxLength: maxLen
        };
    }

    /**
     * Jaro-Winkler similarity for fuzzy string matching
     */
    calculateJaroWinklerSimilarity(str1, str2) {
        return natural.JaroWinklerDistance(str1, str2);
    }

    /**
     * Dice coefficient for set-based similarity
     */
    calculateDiceCoefficient(str1, str2) {
        const bigrams1 = this.getBigrams(str1);
        const bigrams2 = this.getBigrams(str2);

        const intersection = bigrams1.filter(b => bigrams2.includes(b));
        return (2 * intersection.length) / (bigrams1.length + bigrams2.length);
    }

    /**
     * Phase 3: Information Theory Calculations
     */

    /**
     * Calculate mutual information between two discrete variables
     */
    calculateMutualInformation(X, Y) {
        if (X.length !== Y.length) {
            throw new Error('Arrays must have the same length');
        }

        const jointProb = this.calculateJointProbability(X, Y);
        const marginalX = this.calculateMarginalProbability(X);
        const marginalY = this.calculateMarginalProbability(Y);

        let mutualInfo = 0;

        for (const [xyKey, pXY] of jointProb) {
            const [x, y] = xyKey.split('|');
            const pX = marginalX.get(x) || 0;
            const pY = marginalY.get(y) || 0;

            if (pXY > 0 && pX > 0 && pY > 0) {
                mutualInfo += pXY * Math.log2(pXY / (pX * pY));
            }
        }

        return {
            mutualInformation: mutualInfo,
            normalizedMI: this.calculateNormalizedMutualInformation(mutualInfo, marginalX, marginalY),
            jointEntropy: this.calculateJointEntropy(jointProb),
            conditionalEntropy: this.calculateConditionalEntropy(jointProb, marginalX)
        };
    }

    /**
     * Enhanced KL divergence with smoothing techniques
     */
    calculateKLDivergence(P, Q, smoothing = 'laplace', alpha = 1e-10) {
        const pSmoothed = this.applySmoothingToDistribution(P, smoothing, alpha);
        const qSmoothed = this.applySmoothingToDistribution(Q, smoothing, alpha);

        let klDivergence = 0;
        let jssDivergence = 0; // Jensen-Shannon divergence

        // Get all unique keys
        const allKeys = new Set([...Object.keys(pSmoothed), ...Object.keys(qSmoothed)]);

        for (const key of allKeys) {
            const p = pSmoothed[key] || alpha;
            const q = qSmoothed[key] || alpha;

            if (p > 0 && q > 0) {
                klDivergence += p * Math.log2(p / q);

                // Calculate JS divergence component
                const m = (p + q) / 2;
                jssDivergence += 0.5 * (p * Math.log2(p / m) + q * Math.log2(q / m));
            }
        }

        return {
            klDivergence,
            jssDivergence,
            symmetricKL: this.calculateSymmetricKL(pSmoothed, qSmoothed, alpha),
            earthMoverDistance: this.calculateEarthMoverDistance(pSmoothed, qSmoothed)
        };
    }

    /**
     * Cross-entropy calculation with multiple variants
     */
    calculateCrossEntropy(P, Q, base = 2) {
        const logBase = base === 2 ? Math.log2 : (base === Math.E ? Math.log : (x) => Math.log(x) / Math.log(base));

        let crossEntropy = 0;
        let entropyP = 0;
        let relativeEntropy = 0;

        const allKeys = new Set([...Object.keys(P), ...Object.keys(Q)]);

        for (const key of allKeys) {
            const p = P[key] || 1e-10;
            const q = Q[key] || 1e-10;

            if (p > 0) {
                entropyP -= p * logBase(p);
                if (q > 0) {
                    crossEntropy -= p * logBase(q);
                    relativeEntropy += p * logBase(p / q);
                }
            }
        }

        return {
            crossEntropy,
            entropy: entropyP,
            relativeEntropy,
            perplexity: Math.pow(base, crossEntropy),
            conditionalPerplexity: Math.pow(base, crossEntropy - entropyP)
        };
    }

    /**
     * Calculate pointwise mutual information
     */
    calculatePointwiseMutualInformation(word1, word2, corpus) {
        const cooccurrenceCount = this.countCooccurrences(word1, word2, corpus);
        const word1Count = this.countWordOccurrences(word1, corpus);
        const word2Count = this.countWordOccurrences(word2, corpus);
        const totalWords = this.getTotalWordCount(corpus);

        if (cooccurrenceCount === 0 || word1Count === 0 || word2Count === 0) {
            return 0;
        }

        const pXY = cooccurrenceCount / totalWords;
        const pX = word1Count / totalWords;
        const pY = word2Count / totalWords;

        return Math.log2(pXY / (pX * pY));
    }

    /**
     * Advanced entropy calculations
     */
    calculateAdvancedEntropy(data, options = {}) {
        const {
            windowSize = 1,
            calculateConditional = true,
            calculateRenyi = true,
            alpha = 2 // for Rényi entropy
        } = options;

        const distribution = this.calculateNgramDistribution(data, windowSize);

        // Shannon entropy
        const shannonEntropy = this.calculateShannonEntropy(distribution);

        const result = {
            shannonEntropy,
            perplexity: Math.pow(2, shannonEntropy),
            uniformityRatio: shannonEntropy / Math.log2(Object.keys(distribution).length)
        };

        if (calculateRenyi) {
            result.renyiEntropy = this.calculateRenyiEntropy(distribution, alpha);
        }

        if (calculateConditional && windowSize > 1) {
            result.conditionalEntropy = this.calculateConditionalEntropyFromNgrams(data, windowSize);
        }

        return result;
    }

    /**
     * Helper Methods
     */

    extractContext(text, position, length, contextSize = 20) {
        const start = Math.max(0, position - contextSize);
        const end = Math.min(text.length, position + length + contextSize);
        return {
            before: text.substring(start, position),
            match: text.substring(position, position + length),
            after: text.substring(position + length, end)
        };
    }

    getBigrams(str) {
        const tokens = this.wordTokenizer.tokenize(str.toLowerCase());
        const bigrams = [];
        for (let i = 0; i < tokens.length - 1; i++) {
            bigrams.push(tokens[i] + ' ' + tokens[i + 1]);
        }
        return bigrams;
    }

    calculateJointProbability(X, Y) {
        const jointCounts = new Map();
        const total = X.length;

        for (let i = 0; i < X.length; i++) {
            const key = `${X[i]}|${Y[i]}`;
            jointCounts.set(key, (jointCounts.get(key) || 0) + 1);
        }

        const jointProb = new Map();
        for (const [key, count] of jointCounts) {
            jointProb.set(key, count / total);
        }

        return jointProb;
    }

    calculateMarginalProbability(X) {
        const counts = new Map();
        for (const x of X) {
            counts.set(x, (counts.get(x) || 0) + 1);
        }

        const marginal = new Map();
        for (const [key, count] of counts) {
            marginal.set(key, count / X.length);
        }

        return marginal;
    }

    calculateNormalizedMutualInformation(mi, marginalX, marginalY) {
        const entropyX = this.calculateEntropyFromMarginal(marginalX);
        const entropyY = this.calculateEntropyFromMarginal(marginalY);

        const maxEntropy = Math.max(entropyX, entropyY);
        return maxEntropy > 0 ? mi / maxEntropy : 0;
    }

    calculateJointEntropy(jointProb) {
        let entropy = 0;
        for (const prob of jointProb.values()) {
            if (prob > 0) {
                entropy -= prob * Math.log2(prob);
            }
        }
        return entropy;
    }

    calculateConditionalEntropy(jointProb, marginalX) {
        let conditionalEntropy = 0;

        for (const [xyKey, pXY] of jointProb) {
            const x = xyKey.split('|')[0];
            const pX = marginalX.get(x) || 0;

            if (pXY > 0 && pX > 0) {
                const pYGivenX = pXY / pX;
                conditionalEntropy -= pXY * Math.log2(pYGivenX);
            }
        }

        return conditionalEntropy;
    }

    applySmoothingToDistribution(distribution, method, alpha) {
        const smoothed = { ...distribution };
        const totalMass = Object.values(distribution).reduce((sum, val) => sum + val, 0);

        switch (method) {
            case 'laplace':
                const vocabSize = Object.keys(distribution).length;
                for (const key of Object.keys(smoothed)) {
                    smoothed[key] = (smoothed[key] + alpha) / (totalMass + alpha * vocabSize);
                }
                break;

            case 'additive':
                for (const key of Object.keys(smoothed)) {
                    smoothed[key] = (smoothed[key] + alpha) / (totalMass + alpha);
                }
                break;

            case 'absolute':
                const minProb = alpha;
                for (const key of Object.keys(smoothed)) {
                    smoothed[key] = Math.max(smoothed[key], minProb);
                }
                break;
        }

        return smoothed;
    }

    calculateSymmetricKL(P, Q, alpha) {
        let klPQ = 0;
        let klQP = 0;

        const allKeys = new Set([...Object.keys(P), ...Object.keys(Q)]);

        for (const key of allKeys) {
            const p = P[key] || alpha;
            const q = Q[key] || alpha;

            if (p > 0 && q > 0) {
                klPQ += p * Math.log2(p / q);
                klQP += q * Math.log2(q / p);
            }
        }

        return (klPQ + klQP) / 2;
    }

    calculateEarthMoverDistance(P, Q) {
        // Simplified 1D Earth Mover's Distance
        const keys = [...new Set([...Object.keys(P), ...Object.keys(Q)])].sort();

        let cumulativeP = 0;
        let cumulativeQ = 0;
        let emd = 0;

        for (const key of keys) {
            cumulativeP += P[key] || 0;
            cumulativeQ += Q[key] || 0;
            emd += Math.abs(cumulativeP - cumulativeQ);
        }

        return emd;
    }

    calculateNgramDistribution(data, n) {
        const ngrams = new Map();
        const tokens = Array.isArray(data) ? data : this.wordTokenizer.tokenize(data.toLowerCase());

        for (let i = 0; i <= tokens.length - n; i++) {
            const ngram = tokens.slice(i, i + n).join(' ');
            ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
        }

        const total = ngrams.size > 0 ? Array.from(ngrams.values()).reduce((sum, count) => sum + count, 0) : 1;
        const distribution = {};

        for (const [ngram, count] of ngrams) {
            distribution[ngram] = count / total;
        }

        return distribution;
    }

    calculateShannonEntropy(distribution) {
        let entropy = 0;
        for (const prob of Object.values(distribution)) {
            if (prob > 0) {
                entropy -= prob * Math.log2(prob);
            }
        }
        return entropy;
    }

    calculateRenyiEntropy(distribution, alpha) {
        if (alpha === 1) {
            return this.calculateShannonEntropy(distribution);
        }

        let sum = 0;
        for (const prob of Object.values(distribution)) {
            if (prob > 0) {
                sum += Math.pow(prob, alpha);
            }
        }

        return (1 / (1 - alpha)) * Math.log2(sum);
    }

    calculateConditionalEntropyFromNgrams(data, n) {
        if (n <= 1) return 0;

        const ngramDist = this.calculateNgramDistribution(data, n);
        const contextDist = this.calculateNgramDistribution(data, n - 1);

        let conditionalEntropy = 0;

        for (const [ngram, prob] of Object.entries(ngramDist)) {
            const context = ngram.split(' ').slice(0, -1).join(' ');
            const contextProb = contextDist[context] || 0;

            if (prob > 0 && contextProb > 0) {
                const conditionalProb = prob / contextProb;
                conditionalEntropy -= prob * Math.log2(conditionalProb);
            }
        }

        return conditionalEntropy;
    }

    calculateEntropyFromMarginal(marginal) {
        let entropy = 0;
        for (const prob of marginal.values()) {
            if (prob > 0) {
                entropy -= prob * Math.log2(prob);
            }
        }
        return entropy;
    }

    countCooccurrences(word1, word2, corpus, windowSize = 5) {
        const tokens = this.wordTokenizer.tokenize(corpus.toLowerCase());
        let count = 0;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === word1.toLowerCase()) {
                for (let j = Math.max(0, i - windowSize); j <= Math.min(tokens.length - 1, i + windowSize); j++) {
                    if (j !== i && tokens[j] === word2.toLowerCase()) {
                        count++;
                        break;
                    }
                }
            }
        }

        return count;
    }

    countWordOccurrences(word, corpus) {
        const tokens = this.wordTokenizer.tokenize(corpus.toLowerCase());
        return tokens.filter(token => token === word.toLowerCase()).length;
    }

    getTotalWordCount(corpus) {
        return this.wordTokenizer.tokenize(corpus).length;
    }

    /**
     * Cache management
     */
    clearCache() {
        this.cache.clear();
        this.compiledPatterns.clear();
    }

    getCacheStats() {
        return {
            cacheSize: this.cache.size,
            patternMatchersCompiled: this.compiledPatterns.size
        };
    }
}

module.exports = StatisticalAnalysis;