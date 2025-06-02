const asyncHandler = require('express-async-handler');
const { analyzeSkinWithGemini, parseAnalysisResponse } = require('../services/geminiService');
const Product = require('../models/Product');

// Get product data from MongoDB instead of file system
const getProductData = async () => {
  try {
    // Fetch all products from the database
    const products = await Product.find({}).lean();
    console.log(`Fetched ${products.length} products from database`);
    return products;
  } catch (error) {
    console.error('Error fetching product data from database:', error);
    return [];
  }
};

// Analyze skin image and provide recommendations
const analyzeSkin = asyncHandler(async (req, res) => {
  // Check if image was uploaded
  if (!req.file || !req.file.buffer) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  try {
    // Get product data from database (await since it's now async)
    const products = await getProductData();
    
    if (!products || products.length === 0) {
      console.error('No product data available');
      return res.status(500).json({ message: 'No product data available for analysis' });
    }
    
    // Process image with Gemini API using the in-memory buffer
    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    console.log('Processing image from memory buffer, mimetype:', mimeType);
    
    try {
      // Pass the buffer and mimetype directly instead of a file path
      const analysisResult = await analyzeSkinWithGemini(imageBuffer, mimeType, products);
      
      // Parse the Gemini response
      const parsedResult = parseAnalysisResponse(analysisResult);
      
      res.status(200).json({
        success: true,
        rawAnalysis: analysisResult, // For debugging, can be removed in production
        analysis: {
          skinType: parsedResult.skinType,
          skinConcerns: parsedResult.skinConcerns,
          fullAnalysis: parsedResult.analysis
        },
        recommendations: parsedResult.recommendations,
        usagePlan: parsedResult.usagePlan,
        additionalRecommendations: parsedResult.additionalRecommendations
      });
    } catch (apiError) {
      console.error('Error in Gemini API call:', apiError);
      res.status(500).json({
        message: 'Error analyzing image with AI service',
        error: apiError.message
      });
    }
  } catch (error) {
    // No need to clean up files since we're using memory storage
    res.status(500);
    throw new Error(`Error analyzing skin image: ${error.message}`);
  }
});

module.exports = {
  analyzeSkin
};
