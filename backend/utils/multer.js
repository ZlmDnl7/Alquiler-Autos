import multer from "multer";
import DatauriParser from "datauri/parser.js";

// Configure memory storage for multer
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer to upload single file
export const multerSingleUpload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single("image");

// Configure multer to upload multiple files (up to 5)
export const multerMultipleUploads = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  }
}).array("image", 5);

// Legacy export for backwards compatibility
export const multerUploads = multerMultipleUploads;

const parser = new DatauriParser();

// Convert files to base64 with Cloudinary format (for multiple files)
export const dataUri = (req) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new Error('No files found in request');
  }

  const encodedFiles = [];
  
  req.files.forEach((file, index) => {
    try {
      // Use Buffer.from instead of deprecated new Buffer()
      const base64 = Buffer.from(file.buffer).toString('base64');
      
      // Detect actual MIME type instead of hardcoding jpeg
      const mimeType = file.mimetype || 'image/jpeg';
      const base64WithFormat = `data:${mimeType};base64,${base64}`;
      
      encodedFiles.push({
        data: base64WithFormat,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        index: index
      });
    } catch (error) {
      throw new Error(`Failed to process file ${file.originalname}: ${error.message}`);
    }
  });
  
  return encodedFiles;
};

// Convert single file to base64 with DataURI parser
export const base64Converter = (req) => {
  // Handle both single file and multiple files
  const files = req.files || (req.file ? [req.file] : []);
  
  if (files.length === 0) {
    throw new Error('No files found in request');
  }

  const encodedFiles = [];
  
  files.forEach((file, index) => {
    try {
      // Use DataURI parser for proper format detection
      const dataUri = parser.format(file.mimetype, file.buffer);
      
      encodedFiles.push({
        data: dataUri.content,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        encoding: file.encoding,
        fieldname: file.fieldname,
        index: index
      });
    } catch (error) {
      throw new Error(`Failed to convert file ${file.originalname}: ${error.message}`);
    }
  });
  
  return encodedFiles;
};

// Utility function to convert single file buffer to base64
export const bufferToBase64 = (buffer, mimetype = 'image/jpeg') => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer provided');
  }
  
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

// Utility function to validate image file
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size too large: ${file.size} bytes. Maximum allowed: ${maxSize} bytes`);
  }
  
  return true;
};

// Utility function to process and validate multiple files
export const processMultipleFiles = (req) => {
  if (!req.files || !Array.isArray(req.files)) {
    throw new Error('No files array found in request');
  }
  
  // Validate all files first
  req.files.forEach((file, index) => {
    try {
      validateImageFile(file);
    } catch (error) {
      throw new Error(`File ${index + 1} (${file.originalname}): ${error.message}`);
    }
  });
  
  // Convert all files
  return dataUri(req);
};