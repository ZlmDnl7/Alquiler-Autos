import { errorHandler } from './error.js';

/**
 * Valida y sanitiza el ID de MongoDB
 * @param {string} id - ID a validar
 * @param {string} fieldName - Nombre del campo para mensajes de error
 * @returns {string} ID sanitizado
 */
export const validateMongoId = (id, fieldName = 'ID') => {
  if (!id || typeof id !== 'string') {
    throw new Error(`${fieldName} is required and must be a string`);
  }
  
  // Validar formato de ObjectId de MongoDB (24 caracteres hexadecimales)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id.trim())) {
    throw new Error(`${fieldName} must be a valid MongoDB ObjectId`);
  }
  
  return id.trim();
};

/**
 * Valida y sanitiza un email
 * @param {string} email - Email a validar
 * @returns {string} Email sanitizado
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a string');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitizedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(sanitizedEmail)) {
    throw new Error('Email must be a valid email address');
  }
  
  return sanitizedEmail;
};

/**
 * Valida y sanitiza un string genérico
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {string} Valor sanitizado
 */
export const validateString = (value, fieldName, maxLength = 255) => {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} is required and must be a string`);
  }
  
  const sanitized = value.trim();
  
  if (sanitized.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  
  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} cannot exceed ${maxLength} characters`);
  }
  
  return sanitized;
};

/**
 * Valida y sanitiza un número
 * @param {any} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor sanitizado
 */
export const validateNumber = (value, fieldName, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => {
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  if (numValue < min || numValue > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
  
  return numValue;
};

/**
 * Crea un objeto de consulta seguro para MongoDB
 * @param {Object} queryParams - Parámetros de consulta
 * @returns {Object} Objeto de consulta sanitizado
 */
export const createSafeQuery = (queryParams) => {
  const safeQuery = {};
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Sanitizar claves para prevenir inyección
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');
      
      if (sanitizedKey && sanitizedKey === key) {
        safeQuery[sanitizedKey] = value;
      }
    }
  });
  
  return safeQuery;
};

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationError = (error, next) => {
  if (error.message.includes('is required') || 
      error.message.includes('must be') || 
      error.message.includes('cannot be')) {
    return next(errorHandler(400, error.message));
  }
  next(error);
};
