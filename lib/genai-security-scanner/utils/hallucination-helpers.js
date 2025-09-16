/**
 * Helper methods for hallucination detection
 */

const StatisticalAnalysis = require('./statistical-analysis');

class HallucinationHelpers {
    constructor() {
        this.stats = new StatisticalAnalysis();
    }

    /**
     * Calculate PMI scores for important terms
     */
    calculatePMIScores(responseTokens, answerTokens, questionTokens) {
        const pmiScores = [];
        const corpus = [...responseTokens, ...answerTokens, ...questionTokens].join(' ');

        for (const answerToken of answerTokens) {
            if (answerToken.length > 2) {
                for (const responseToken of responseTokens) {
                    if (responseToken.length > 2) {
                        try {
                            const pmi = this.stats.calculatePointwiseMutualInformation(
                                answerToken, responseToken, corpus
                            );
                            if (pmi > 0) {
                                pmiScores.push({
                                    answerTerm: answerToken,
                                    responseTerm: responseToken,
                                    pmi
                                });
                            }
                        } catch (e) {
                            // Skip if PMI calculation fails
                            continue;
                        }
                    }
                }
            }
        }

        return pmiScores.sort((a, b) => b.pmi - a.pmi).slice(0, 5);
    }

    /**
     * Calculate information gain
     */
    calculateInformationGain(responseTokens, answerTokens) {
        if (responseTokens.length === 0 || answerTokens.length === 0) return 0;

        try {
            const responseDist = this.stats.calculateNgramDistribution(responseTokens, 1);
            const answerDist = this.stats.calculateNgramDistribution(answerTokens, 1);

            const responseEntropy = this.stats.calculateShannonEntropy(responseDist);
            const answerEntropy = this.stats.calculateShannonEntropy(answerDist);

            return Math.abs(responseEntropy - answerEntropy);
        } catch (e) {
            return 0;
        }
    }

    /**
     * Get factual patterns for different categories
     */
    getFactualPatterns(category) {
        const patterns = {
            geography: ['capital', 'city', 'country', 'continent', 'located'],
            history: ['year', 'century', 'war', 'battle', 'event', 'happened'],
            math: ['equals', 'answer', 'result', 'sum', 'product'],
            science: ['element', 'symbol', 'formula', 'chemical', 'compound'],
            technology: ['language', 'programming', 'written', 'developed'],
            literature: ['author', 'wrote', 'book', 'novel', 'play'],
            astronomy: ['planet', 'solar system', 'space', 'orbit'],
            art: ['painted', 'artist', 'painting', 'artwork'],
            physics: ['speed', 'light', 'velocity', 'meters', 'second'],
            common_knowledge: ['days', 'week', 'month', 'time']
        };

        return patterns[category] || [];
    }

    /**
     * Calculate consistency score
     */
    calculateConsistencyScore(patternMatches, contradictions, expectedAnswer) {
        let score = 0;

        // Positive score for factual patterns
        score += patternMatches.length * 0.2;

        // Negative score for contradictions
        score -= contradictions.length * 0.3;

        // Check if expected answer appears in factual context
        const answerTokens = expectedAnswer.toLowerCase().split(/\s+/);
        for (const match of patternMatches) {
            const context = match.context;
            for (const token of answerTokens) {
                if (context.match && context.match.toLowerCase().includes(token)) {
                    score += 0.5;
                }
            }
        }

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate information divergence across responses
     */
    calculateInformationDivergence(responses) {
        if (responses.length < 2) return 0;

        try {
            const distributions = responses.map(response => {
                const tokens = response.toLowerCase().split(/\s+/).filter(t => t.length > 0);
                return this.stats.calculateNgramDistribution(tokens, 1);
            });

            let totalDivergence = 0;
            let comparisons = 0;

            for (let i = 0; i < distributions.length - 1; i++) {
                for (let j = i + 1; j < distributions.length; j++) {
                    const kl = this.stats.calculateKLDivergence(distributions[i], distributions[j], 'laplace');
                    totalDivergence += kl.jssDivergence; // Use Jensen-Shannon for symmetry
                    comparisons++;
                }
            }

            return comparisons > 0 ? totalDivergence / comparisons : 0;
        } catch (e) {
            return 0;
        }
    }
}

module.exports = HallucinationHelpers;