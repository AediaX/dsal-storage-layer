import CryptoJS from 'crypto-js';

class Steganography {
  // Encrypt text before hiding
  static encryptText(text, password) {
    return CryptoJS.AES.encrypt(text, password).toString();
  }

  // Decrypt text after extracting
  static decryptText(encryptedText, password) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, password);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return null;
    }
  }

  // Hide text in image
  static hideTextInImage(imageData, text, password) {
    // Encrypt the text first
    const encryptedText = this.encryptText(text, password);
    
    // Convert text to binary
    const binaryText = this.textToBinary(encryptedText + '###'); // ### as delimiter
    let textIndex = 0;
    
    // Get image data
    const data = imageData.data;
    
    // Hide text in LSB (Least Significant Bit) of each pixel
    for (let i = 0; i < data.length && textIndex < binaryText.length; i += 4) {
      // Hide in RGB channels, skip alpha
      for (let j = 0; j < 3 && textIndex < binaryText.length; j++) {
        // Clear the LSB and set it to our bit
        data[i + j] = (data[i + j] & 0xFE) | parseInt(binaryText[textIndex]);
        textIndex++;
      }
    }
    
    return imageData;
  }

  // Extract text from image
  static extractTextFromImage(imageData, password) {
    const data = imageData.data;
    let binaryText = '';
    
    // Extract LSB from each pixel
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        // Get the LSB
        binaryText += data[i + j] & 1;
      }
    }
    
    // Convert binary to text
    const extractedText = this.binaryToText(binaryText);
    
    // Find the delimiter
    const delimiterIndex = extractedText.indexOf('###');
    if (delimiterIndex === -1) return null;
    
    const encryptedText = extractedText.substring(0, delimiterIndex);
    
    // Decrypt the text
    return this.decryptText(encryptedText, password);
  }

  // Helper: Convert text to binary
  static textToBinary(text) {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
  }

  // Helper: Convert binary to text
  static binaryToText(binary) {
    const bytes = binary.match(/.{1,8}/g);
    if (!bytes) return '';
    
    return bytes.map(byte => {
      return String.fromCharCode(parseInt(byte, 2));
    }).join('');
  }

  // Create downloadable image
  static createDownloadableImage(canvas, filename = 'hidden-message.png') {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    });
  }
}

export default Steganography;