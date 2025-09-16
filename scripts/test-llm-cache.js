#!/usr/bin/env node

// Test script - generates just 5 combinations for testing
const fs = require('fs').promises;
const path = require('path');

// Override config for testing
process.env.MAX_COMBINATIONS = '5';
process.env.CACHE_OUTPUT_DIR = 'public/data';

console.log('🧪 TEST MODE - Generating 5 combinations only');
console.log('============================================');

// Import and run the main generator
require('./generate-llm-cache.js');