// Test script for word count limits
const calculateWordCount = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  const words = text.trim().split(/\s+/);
  const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with']);
  
  return words.filter(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    return cleanWord.length > 0 && !stopWords.has(cleanWord);
  }).length;
};

const getMaxQuestionsForWordCount = (wordCount) => {
  const limits = {
    0: 10,     // 0-100 words: max 10 questions
    101: 20,   // 101-200 words: max 20 questions
    201: 30,   // 201-300 words: max 30 questions
    301: 40,   // 301-500 words: max 40 questions
    501: 50,   // 501+ words: max 50 questions
  };
  
  const minWords = 20;
  
  if (wordCount < minWords) {
    return 0;
  }
  
  const thresholds = Object.keys(limits).map(Number).sort((a, b) => a - b);
  
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (wordCount >= thresholds[i]) {
      return limits[thresholds[i]];
    }
  }
  
  return limits[0];
};

// Test cases
const testCases = [
  { text: "Hello world", expected: 0, description: "Very short text" },
  { text: "This is a test sentence with more words to see if it works properly", expected: 10, description: "Medium text" },
  { text: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum", expected: 20, description: "Long text" },
  { text: "This is a very long text that should generate many questions. ".repeat(50), expected: 50, description: "Very long text" },
];

console.log('Testing Word Count Limits:\n');

testCases.forEach((testCase, index) => {
  const wordCount = calculateWordCount(testCase.text);
  const maxQuestions = getMaxQuestionsForWordCount(wordCount);
  
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`Words: ${wordCount}, Max Questions: ${maxQuestions}`);
  console.log(`Expected: ${testCase.expected}, Actual: ${maxQuestions}`);
  console.log(`Status: ${maxQuestions === testCase.expected ? '✅ PASS' : '❌ FAIL'}\n`);
});

// Test word count ranges
console.log('Word Count Ranges:');
console.log('0-100 words: Max 10 questions');
console.log('101-200 words: Max 20 questions');
console.log('201-300 words: Max 30 questions');
console.log('301-500 words: Max 40 questions');
console.log('501+ words: Max 50 questions');
console.log('Minimum required: 20 words'); 