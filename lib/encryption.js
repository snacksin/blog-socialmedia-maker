// Encryption utilities for securely storing API keys

import crypto from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Text to encrypt (e.g. API key)
 * @returns {string} - Encrypted text in format: iv:encryptedData (hex encoded)
 */
export function encrypt(text) {
  // In production, ensure ENCRYPTION_KEY is set in environment variables
  // and is 32 bytes (256 bits) long
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development';
  
  if (!text) return null;
  
  try {
    // Create an initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher with key and iv
    const cipher = crypto.createCipheriv(
      ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), 
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted data as a single string
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text that was encrypted with the encrypt function
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted text
 */
export function decrypt(encryptedText) {
  // In production, ensure ENCRYPTION_KEY is set and matches encryption key
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development';
  
  if (!encryptedText) return null;
  
  try {
    // Split iv and encrypted data
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher with key and iv
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), 
      iv
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Test if a string is encrypted by attempting to decrypt it
 * @param {string} text - Text to test
 * @returns {boolean} - True if text is encrypted, false otherwise
 */
export function isEncrypted(text) {
  if (!text) return false;
  
  try {
    // Check if format matches encrypted format (iv:encrypted)
    const parts = text.split(':');
    if (parts.length !== 2) return false;
    
    // Check if iv part is valid hex of correct length
    const iv = parts[0];
    if (iv.length !== IV_LENGTH * 2) return false;
    
    // Try to convert to buffer to confirm it's valid hex
    try {
      Buffer.from(iv, 'hex');
      Buffer.from(parts[1], 'hex');
    } catch {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
