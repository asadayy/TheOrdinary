import axios from 'axios';
import API_URL from '../config/api.js';
import { useState } from 'react';
import imageNotFound from '../Components/Assets/ImageNotFound.png';
import './Styles/SkinAnalyzer.css';

const SkinAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = imageNotFound;
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetImage(e.dataTransfer.files[0]);
    }
  };

  // Prevent default behavior for drag events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Validate and set the image
  const validateAndSetImage = (file) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG or PNG image');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    // Set the image and preview
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  // Reset the form
  const resetAnalysis = () => {
    setImage(null);
    setPreview('');
    setResult(null);
    setError('');
    
    // Revoke object URL to avoid memory leaks
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  // Submit the image for analysis
  const handleSubmit = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('skinImage', image);

    try {
      // Directly use the backend URL instead of relying on the proxy
      const response = await axios.post(`${API_URL}/api/skin-analyzer/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.response?.data?.message || 'Error analyzing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render the upload section
  const renderUploadSection = () => {
    return (
      <div className="upload-section">
        <div 
          className="dropzone" 
          onDrop={handleDrop} 
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input 
            type="file" 
            id="file-input" 
            style={{ display: 'none' }} 
            onChange={handleFileSelect}
            accept="image/jpeg,image/jpg,image/png"
          />
          
          {preview ? (
            <div className="preview-container">
              <img 
                src={preview} 
                alt="Preview" 
                className="image-preview"
                onError={handleImageError}
              />
              <button 
                className="change-image-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  resetAnalysis(); 
                }}
              >
                Change Image
              </button>
            </div>
          ) : (
            <div>
              <p>Drag and drop your skin image here, or click to select a file</p>
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                Supported formats: JPEG, PNG (max 5MB)
              </p>
            </div>
          )}
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button 
          className="analyze-button" 
          onClick={handleSubmit} 
          disabled={!image || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze My Skin'}
        </button>
        
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    );
  };

  // Render the analysis results
  const renderAnalysisResults = () => {
    if (!result) return null;

    // Function to format markdown content with better styling
    const formatMarkdown = (content) => {
      if (!content) return '';
      // If this is the recommendations section, use improved parsing
      if (content.includes('Product Name:')) {
        // Split into product blocks
        const productBlocks = content.split(/(?=Product Name:)/g);
        return productBlocks.map(block => {
          const nameMatch = block.match(/Product Name:\s*([^\n]+)/i);
          const whyMatch = block.match(/Why It Helps:\s*([^\n]+)/i);
          const ingredientsMatch = block.match(/Key Ingredients:\s*([^\n]+)/i);
          const resultsMatch = block.match(/Expected Results:\s*([^\n]+)/i);
          const usageMatch = block.match(/Usage Instructions?:\s*([^\n]+)/i);

          if (!nameMatch) return '';
          return `<div class="product-section simple">
            <h3>${nameMatch[1].trim()}</h3>
            <div class="product-details-section">
              <div class="product-why-helps">
                <h4>Why It Helps:</h4>
                <p>${whyMatch ? whyMatch[1].trim() : 'Addresses your specific skin concerns based on analysis.'}</p>
              </div>
              <div class="product-key-ingredients">
                <h4>Key Ingredients:</h4>
                <ul>
                  ${ingredientsMatch && ingredientsMatch[1] ? ingredientsMatch[1].split(',').map(ingredient => `<li>${ingredient.trim()}</li>`).join('') : '<li>Contains active ingredients tailored for your skin needs</li>'}
                </ul>
              </div>
              ${resultsMatch && resultsMatch[1] ? `<div class="product-expected-results"><h4>Expected Results:</h4><p>${resultsMatch[1].trim()}</p></div>` : ''}
              ${usageMatch && usageMatch[1] ? `<div class="product-usage"><h4>Usage Instructions:</h4><p>${usageMatch[1].trim()}</p></div>` : ''}
            </div>
          </div>`;
        }).join('');
      }
      // Pre-process content
      let formatted = content
        .trim()
        // Remove any existing formatting markers
        .replace(/___LIST_SECTION___/g, '')
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        // Remove isolated dashes that aren't bullet points
        .replace(/^\s*-\s*$/gm, '')
        // Convert asterisks at beginning of line to bullet points
        .replace(/^\s*\* /gm, '- ');
      
      // Create section headers - simple styling
      formatted = formatted.replace(/^(Skin Analysis|Recommended Products|Usage Plan|Additional Recommendations)\s*$/gm, 
        '<h2>$1</h2>');
      
      // Process named sections
      const sections = [
        'Skin Type:', 'Skin Concerns:', 'Skin Condition:', 
        'Morning Routine:', 'Evening Routine:',
        'Dietary Suggestions:', 'Lifestyle Recommendations:', 'Hygiene Tips:'
      ];
      
      for (const section of sections) {
        const regex = new RegExp(`(${section})\\s*([^\\n]+)(?:\\n|$)`, 'g');
        formatted = formatted.replace(regex, '<h3>$1</h3><p>$2</p>');
      }
      
      // Process product sections - consistent formatting without images/links
      formatted = formatted
        // Format product name sections with consistent styling
        // Look for product IDs in parentheses like (skincare-11)
        // eslint-disable-next-line no-useless-escape
        .replace(/Product Name:\s*([^\n(]+)\s*\(([^\)]+)\)/g, (match, productName, productId) => {
          const productNameTrimmed = productName.trim();
          
          // Escape special characters in product name for regex
          // eslint-disable-next-line no-useless-escape
          const escapedProductName = productNameTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // Extract all details from AI response
          // Find benefits/why it helps for this specific product
          // eslint-disable-next-line no-useless-escape
          const benefitsRegex = new RegExp(`${escapedProductName}[^\n]*?(?:benefits|why it helps|helps with|good for)\s*:?\s*([^\n]+)`, 'i');
          const benefitsMatch = result.recommendations.match(benefitsRegex);
          const benefits = benefitsMatch && benefitsMatch[1] ? benefitsMatch[1].trim() : '';
          
          // Find ingredients for this specific product
          // eslint-disable-next-line no-useless-escape
          const ingredientRegex = new RegExp(`${escapedProductName}[^\n]*?ingredients?:?\s*([^\n]+)`, 'i');
          const ingredientMatch = result.recommendations.match(ingredientRegex);
          
          // Find usage instructions if available
          // eslint-disable-next-line no-useless-escape
          const usageRegex = new RegExp(`${escapedProductName}[^\n]*?(?:usage|how to use|apply|application)\s*:?\s*([^\n]+)`, 'i');
          const usageMatch = result.recommendations.match(usageRegex);
          
          // Create a consistent product section with simple headings and dynamically populated content
          return `<div class="product-section simple">
            <h3>${productNameTrimmed}</h3>
            
            <div class="product-details-section">
              <div class="product-why-helps">
                <h4>Why It Helps:</h4>
                <p>${benefits || 'Addresses your specific skin concerns based on analysis.'}</p>
              </div>
              
              <div class="product-key-ingredients">
                <h4>Key Ingredients:</h4>
                <ul>
                  ${ingredientMatch && ingredientMatch[1] ? 
                    ingredientMatch[1].split(',').map(ingredient => `<li>${ingredient.trim()}</li>`).join('') : 
                    '<li>Contains active ingredients tailored for your skin needs</li>'}
                </ul>
              </div>
              
              ${usageMatch && usageMatch[1] ? `
              <div class="product-usage">
                <h4>How to Use:</h4>
                <p>${usageMatch[1].trim()}</p>
              </div>` : ''}
            </div>
          </div>`;
        })
        
        // Fallback for product names without ID
        .replace(/Product Name:\s*([^\n]+)(?!\()/g, (match, productName) => {
          const productNameTrimmed = productName.trim();
          
          // Escape special characters in product name for regex
          // eslint-disable-next-line no-useless-escape
          const escapedProductName = productNameTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // Extract all details from AI response
          // Find benefits/why it helps for this specific product
          // eslint-disable-next-line no-useless-escape
          const benefitsRegex = new RegExp(`${escapedProductName}[^\n]*?(?:benefits|why it helps|helps with|good for)\s*:?\s*([^\n]+)`, 'i');
          const benefitsMatch = result.recommendations.match(benefitsRegex);
          const benefits = benefitsMatch && benefitsMatch[1] ? benefitsMatch[1].trim() : '';
          
          // Find ingredients for this specific product
          // eslint-disable-next-line no-useless-escape
          const ingredientRegex = new RegExp(`${escapedProductName}[^\n]*?ingredients?:?\s*([^\n]+)`, 'i');
          const ingredientMatch = result.recommendations.match(ingredientRegex);
          
          // Find usage instructions if available
          // eslint-disable-next-line no-useless-escape
          const usageRegex = new RegExp(`${escapedProductName}[^\n]*?(?:usage|how to use|apply|application)\s*:?\s*([^\n]+)`, 'i');
          const usageMatch = result.recommendations.match(usageRegex);
          
          return `<div class="product-section simple">
            <h3>${productNameTrimmed}</h3>
            
            <div class="product-details-section">
              <div class="product-why-helps">
                <h4>Why It Helps:</h4>
                <p>${benefits || 'Addresses your specific skin concerns based on analysis.'}</p>
              </div>
              
              <div class="product-key-ingredients">
                <h4>Key Ingredients:</h4>
                <ul>
                  ${ingredientMatch && ingredientMatch[1] ? 
                    ingredientMatch[1].split(',').map(ingredient => `<li>${ingredient.trim()}</li>`).join('') : 
                    '<li>Contains active ingredients tailored for your skin needs</li>'}
                </ul>
              </div>
              
              ${usageMatch && usageMatch[1] ? `
              <div class="product-usage">
                <h4>How to Use:</h4>
                <p>${usageMatch[1].trim()}</p>
              </div>` : ''}
            </div>
          </div>`;
        })
        
        // Format Why It Helps sections
        .replace(/Why It Helps:\s*([^\n]+)/g, '<div class="benefit-section"><h4 class="key-section">Why It Helps:</h4><p>$1</p></div>')
        
        // Format Key Ingredients sections
        .replace(/Key Ingredients:\s*([^\n]+)/g, '<div class="ingredients-section"><h4 class="key-section">Key Ingredients:</h4><p>$1</p></div>')
        
        // Format Usage Frequency sections
        .replace(/Usage Frequency:\s*([^\n]+)/g, '<div class="usage-section"><h4 class="key-section">Usage Frequency:</h4><p>$1</p></div>')
        
        // Format Application Tips sections
        .replace(/Application Tips:\s*([^\n]+)/g, '<div class="tips-section"><h4 class="key-section">Application Tips:</h4><p>$1</p></div>');
      
      // Process bold and italic formatting
      formatted = formatted
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Format numbered lists in routines
      formatted = formatted.replace(/(\d+\.)\s+([^\n]+)/g, '<li>$2</li>');
      
      // Special handling for skin analysis and recommended products sections
      // We'll format these sections as paragraphs, not lists
      const analysisSectionRegex = /(<h2 class="section-title">Skin Analysis<\/h2>[\s\S]*?)(?=<h2|$)/i;
      formatted = formatted.replace(analysisSectionRegex, section => {
        return section.replace(/^-\s+([^\n]+)/gm, '<p>$1</p>');
      });
      
      const productsSectionRegex = /(<h2 class="section-title">Recommended Products<\/h2>[\s\S]*?)(?=<h2|$)/i;
      formatted = formatted.replace(productsSectionRegex, section => {
        return section.replace(/^-\s+([^\n]+)/gm, '<p>$1</p>');
      });
      
      // For other sections, process bullet points and create lists normally
      formatted = formatted
        // Convert lines starting with - to list items (but not in already processed sections)
        .replace(/^-\s+([^\n]+)/gm, '<li>$1</li>')
        // Group consecutive list items
        .replace(/(<li>.*?<\/li>[\s\n]*)+/g, match => `<ul class="analysis-list">${match}</ul>`);
      
      // Fix paragraph breaks
      formatted = formatted
        // Double line breaks become separate paragraphs
        .replace(/\n\n+/g, '</p><p>')
        // Single line breaks within paragraphs become <br> tags
        .replace(/(?<!<\/[^>]+>)\n(?!<[^>]+>)/g, '<br>');
      
      // Clean up formatting
      formatted = formatted
        // Remove any nested lists
        .replace(/<ul[^>]*>\s*<ul[^>]*>/g, '<ul class="analysis-list">')
        .replace(/<\/ul>\s*<\/ul>/g, '</ul>')
        
        // Wrap standalone text in paragraph tags
        .replace(/^(?!<h|<ul|<p|<li|<div)(.+)$/gm, '<p>$1</p>')
        
        // Clean up empty paragraphs
        .replace(/<p>\s*<\/p>/g, '');
      
      // Ensure proper HTML structure
      if (!formatted.match(/^<(h|p|ul|div)/)) {
        formatted = '<p>' + formatted;
      }
      
      if (!formatted.match(/<\/(p|h[1-6]|ul|div)>$/)) {
        formatted += '</p>';
      }
      // Remove any stray ** or * not inside HTML tags
      formatted = formatted.replace(/(^|>)[*]{1,2}([^<\s][^<]*?)[*]{1,2}(?=<|$)/g, '$1$2');
      return formatted;
    };

    return (
      <div className="analysis-results">
        {/* Centered image at the top */}
        <div className="results-image-container centered">
          <img 
            src={preview} 
            alt="Your skin" 
            className="results-image" 
            onError={handleImageError}
          />
          <button className="new-analysis-btn" onClick={resetAnalysis}>
            New Analysis
          </button>
        </div>

        {/* Skin Analysis Section below the image */}
        <div className="analysis-section">
          <h3>Skin Analysis</h3>
          <div className="markdown-content" 
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdown(result.analysis.fullAnalysis) 
            }}
          />
        </div>
        {/* Product Recommendations Section */}
        <div className="recommendations-section">
          <h2 className="section-title">RECOMMENDED PRODUCTS</h2>
          <p className="recommendation-intro">Based on your skin analysis, we recommend the following products to address your specific concerns:</p>
          <div className="markdown-content" 
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdown(result.recommendations) 
            }}
          />
        </div>
        {/* Usage Plan Section */}
        <div className="usage-plan-section">
          <h3>Usage Plan</h3>
          <div className="markdown-content" 
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdown(result.usagePlan)
            }}
          />
        </div>
        {/* Additional Recommendations Section */}
        <div className="additional-suggestions">
          <h3>Additional Recommendations</h3>
          <div className="markdown-content" 
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdown(result.additionalRecommendations)
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="skin-analyzer-container">
      <h1>Skin Analyzer</h1>
      <p className="analyzer-description">
        Upload a clear image of your skin to receive a personalized analysis and product recommendations 
        tailored to your unique skin concerns. Our AI-powered tool will analyze your skin condition and 
        suggest the most suitable products from The Ordinary.
      </p>
      
      {!result ? renderUploadSection() : renderAnalysisResults()}
    </div>
  );
};

export default SkinAnalyzer;
