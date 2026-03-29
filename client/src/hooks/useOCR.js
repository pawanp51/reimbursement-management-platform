import { useState } from 'react';
import Tesseract from 'tesseract.js';

export const useOCR = () => {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  const extractDataFromText = (text) => {
    const extracted = {
      amount: null,
      date: null,
      vendor: null,
      description: null,
      confidence: 0,
    };

    const amountPatterns = [
      /(?:[$RsEURGBPINR ]+)\s*(\d+(?:[.,]\d{2})?)/gi,
      /\b(\d+(?:\.\d{2})?)\s*(?:USD|INR|EUR|GBP)/gi,
      /(?:total|amount|total\s+amount)[\s:]*[$RsEURGBPINR ]?\s*(\d+(?:[.,]\d{2})?)/gi,
    ];

    for (const pattern of amountPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        let amount = match[1].replace(',', '.');
        amount = parseFloat(amount);
        if (amount > 0 && (!extracted.amount || amount > extracted.amount)) {
          extracted.amount = amount;
        }
      }
    }

    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/gi,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/gi,
      /([A-Za-z]+\s+\d{1,2}(?:,?\s+\d{4})?)/gi,
    ];

    for (const pattern of datePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const parsedDate = new Date(match[1]);
        if (parsedDate instanceof Date && !isNaN(parsedDate)) {
          extracted.date = parsedDate.toISOString().split('T')[0];
          break;
        }
      }
      if (extracted.date) break;
    }

    const vendorPatterns = [
      /(?:merchant|billed\s+to|from|vendor)[:\s]+([^\n]+)/gi,
      /^([A-Z][^\n]*(?:store|shop|restaurant|hotel|uber|flight|airline|cafe|coffee|gas|fuel|motel).*)/gmi,
    ];

    for (const pattern of vendorPatterns) {
      const match = pattern.exec(text);
      if (match?.[1]) {
        extracted.vendor = match[1].trim();
        break;
      }
    }

    const meaningfulLines = text
      .split('\n')
      .filter((line) => line.trim().length > 10 && !line.match(/^\d+/) && !line.match(/^[\s]*$/));

    if (meaningfulLines.length > 0) {
      extracted.description = meaningfulLines[0].trim().substring(0, 100);
    }

    let confidence = 0;
    if (extracted.amount) confidence += 30;
    if (extracted.date) confidence += 25;
    if (extracted.vendor) confidence += 25;
    if (extracted.description) confidence += 20;
    extracted.confidence = Math.min(100, confidence);

    return extracted;
  };

  const processImage = async (imageFile) => {
    if (!imageFile) {
      setOcrError('No image selected');
      return null;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      setOcrError('Image size must be less than 5MB');
      return null;
    }

    setOcrLoading(true);
    setOcrError('');
    setExtractedData(null);

    try {
      const reader = new FileReader();
      const imageData = await new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: (message) => {
          if (message.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(message.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      const data = extractDataFromText(text);
      data.ocrFullText = text;

      setExtractedData(data);
      return data;
    } catch (error) {
      setOcrError(`OCR failed: ${error.message}`);
      return null;
    } finally {
      setOcrLoading(false);
    }
  };

  return {
    processImage,
    ocrLoading,
    ocrError,
    extractedData,
    setExtractedData,
  };
};
