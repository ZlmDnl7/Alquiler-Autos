import { errorHandler } from "../utils/error.js";
import User from "../models/user.js"; // Asumiendo que falta esta importación
import bcryptjs from "bcryptjs"; // Asumiendo que falta esta importación

const expireDate = new Date(Date.now() + 3600000);

// Función auxiliar para validar usuario existente
const validateExistingUser = (existingUser, email, username) => {
  if (!existingUser) return null;
  
  if (existingUser.email === email) {
    return "El email ya está registrado";
  }
  
  if (existingUser.username === username) {
    return "El nombre de usuario ya está en uso";
  }
  
  return null;
};

// Función auxiliar para crear datos del usuario
const createUserData = (username, email, hashedPassword, phoneNumber) => {
  const userData = {
    username,
    email,
    password: hashedPassword,
    isUser: true,
  };
  
  if (phoneNumber && phoneNumber.trim() !== '') {
    userData.phoneNumber = phoneNumber.trim();
  }
  
  return userData;
};

// Función auxiliar para manejar errores de duplicado de MongoDB
const handleDuplicateError = (error) => {
  const field = Object.keys(error.keyPattern)[0];
  const messages = {
    email: 'El email ya está registrado',
    username: 'El nombre de usuario ya está en uso'
  };
  
  return messages[field] || 'Error de duplicado en el sistema';
};

export const signUp = async (req, res, next) => {
  const { username, email, password, phoneNumber } = req.body;
  
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    const validationError = validateExistingUser(existingUser, email, username);
    if (validationError) {
      return next(errorHandler(400, validationError));
    }
    
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const userData = createUserData(username, email, hashedPassword, phoneNumber);
    
    const newUser = new User(userData);
    await newUser.save();
    
    res.status(200).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    console.error("Error en signUp:", error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const message = handleDuplicateError(error);
      return next(errorHandler(400, message));
    }
    
    next(error);
  }
};