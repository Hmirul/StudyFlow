// Utility functions for interacting with the Gemini API

// Base URL for the Gemini API - using gemini-2.0-flash model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a response from the Gemini API
 * @param {string} prompt - The user's message or prompt
 * @param {string} apiKey - Your Gemini API key
 * @param {Array} context - Optional context messages to include
 * @returns {Promise<string>} - The generated response text
 */
export const generateGeminiResponse = async (prompt, apiKey, context = []) => {
  try {
    // If no API key is provided, return a mock response
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      console.warn('Using mock response because no API key was provided');
      return mockGeminiResponse(prompt);
    }
    
    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    
    // Format the content for the Gemini API according to their specifications
    // This structure follows the format required by the Gemini 2.0 Flash API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    // Log request details for debugging (sanitized API key)
    console.log('Request URL:', GEMINI_API_URL);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    // Parse and return the response
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected API response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error; // Let the caller handle the error
  }
};

/**
 * Generate a mock response when Gemini API is not available
 * @param {string} prompt - The user's message or prompt
 * @returns {string} - A mock response
 */
const mockGeminiResponse = (prompt) => {
  // Simple keyword matching for mock responses
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('hello') || promptLower.includes('hi')) {
    return 'Hello! How can I help you with your studies today?';
  }
  
  if (promptLower.includes('math') || promptLower.includes('formula') || promptLower.includes('equation')) {
    return 'Mathematics is all about problem-solving. Is there a specific math concept or problem you need help with?';
  }
  
  if (promptLower.includes('science') || promptLower.includes('experiment')) {
    return 'Science is fascinating! It helps us understand the world around us through observation and experimentation. What science topic are you studying?';
  }
  
  if (promptLower.includes('english') || promptLower.includes('grammar') || promptLower.includes('writing')) {
    return 'English language skills are essential for effective communication. Are you working on grammar, vocabulary, or perhaps an essay?';
  }
  
  if (promptLower.includes('history') || promptLower.includes('sejarah')) {
    return 'History helps us understand our past and how it shapes our present. Which historical period or event are you studying?';
  }
  
  // Default response
  return 'That\'s an interesting question! Can you tell me more about what you\'re trying to understand? I\'m here to help with your studies.';
};

/**
 * Format context information for sending to Gemini
 * @param {Object} contextInfo - Information about the user's grade level and subject
 * @returns {string} - Formatted context string
 */
export const formatEducationalContext = (contextInfo) => {
  const { form, subject, subjectTitle } = contextInfo;
  
  return `You are an educational AI tutor for a Form ${form} student (${formToAgeRange(form)} years old) studying ${subjectTitle}. 
  Provide accurate, grade-appropriate answers that are helpful, educational, and easy to understand.
  Always provide explanations that would be suitable for a student at this academic level.
  If you don't know the answer to something, acknowledge this rather than making up information.`;
};

/**
 * Convert form number to approximate age range
 * @param {string|number} form - The form/grade number
 * @returns {string} - Age range string
 */
const formToAgeRange = (form) => {
  const formNum = parseInt(form, 10);
  switch (formNum) {
    case 1: return '13-14';
    case 2: return '14-15';
    case 3: return '15-16';
    case 4: return '16-17';
    case 5: return '17-18';
    default: return '13-18';
  }
};

// Add a default export with all the functions
const GeminiAPI = {
  generateGeminiResponse,
  formatEducationalContext
};

export default GeminiAPI;