import User from "../../models/userModel.js";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";
import { errorHandler } from "../../utils/error.js";

const expireDate = new Date(Date.now() + 3600000);

// Función para validar y sanitizar email
const validateAndSanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const sanitizedEmail = email.toString().trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    return null;
  }
  
  return sanitizedEmail;
};

// Función para validar string simple
const validateString = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  return input.toString().trim();
};

// Función para validar y sanitizar photo URL
const validateAndSanitizePhoto = (photo) => {
  if (!photo) {
    return null;
  }
  
  const photoString = validateString(photo);
  if (!photoString) {
    return null;
  }
  
  try {
    new URL(photoString);
    return photoString;
  } catch {
    return null;
  }
};

// Función para generar username único
const generateUniqueUsername = (sanitizedName) => {
  const baseUsername = sanitizedName
    .split(" ")
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  
  const randomSuffix = 
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-8);
  
  return baseUsername + randomSuffix;
};

// Función para crear respuesta con cookie y token
const createAuthResponse = (res, user, token) => {
  const { password: _, ...rest } = user;
  
  return res
    .cookie("access_token", token, {
      httpOnly: true,
      expires: expireDate,
    })
    .status(200)
    .json(rest);
};

// Función para manejar usuario existente
const handleExistingVendor = (res, user) => {
  const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);
  return createAuthResponse(res, user, token);
};

// Función para crear nuevo vendor
const createNewVendor = async (sanitizedEmail, sanitizedName, sanitizedPhoto) => {
  const generatedPassword =
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-8);
  const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
  
  const newUser = new User({
    profilePicture: sanitizedPhoto,
    password: hashedPassword,
    username: generateUniqueUsername(sanitizedName),
    email: sanitizedEmail,
    isVendor: true,
  });
  
  return await newUser.save();
};

// Función para manejar la creación de nuevo vendor
const handleNewVendor = async (res, next, sanitizedEmail, sanitizedName, sanitizedPhoto) => {
  try {
    const savedUser = await createNewVendor(sanitizedEmail, sanitizedName, sanitizedPhoto);
    const userObject = savedUser.toObject();
    const token = Jwt.sign({ id: savedUser._id }, process.env.ACCESS_TOKEN);
    
    return createAuthResponse(res, userObject, token);
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "email already in use"));
    }
    throw error;
  }
};

export const vendorSignup = async (req, res, next) => {
  const { username, email, password } = req.body;
  
  try {
    // Validar y sanitizar inputs
    const sanitizedUsername = validateString(username);
    const sanitizedEmail = validateAndSanitizeEmail(email);
    const sanitizedPassword = validateString(password);
    
    if (!sanitizedUsername || !sanitizedEmail || !sanitizedPassword) {
      return next(errorHandler(400, 'Username, email and password are required and must be valid'));
    }
    
    const hashedPassword = bcryptjs.hashSync(sanitizedPassword, 10);
    
    const user = new User({
      username: sanitizedUsername,
      password: hashedPassword,
      email: sanitizedEmail,
      isVendor: true,
    });
    
    await user.save();
    res.status(200).json({ message: "vendor created successfully" });
  } catch (error) {
    next(error);
  }
};

export const vendorSignin = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    // Validar y sanitizar email
    const sanitizedEmail = validateAndSanitizeEmail(email);
    const sanitizedPassword = validateString(password);
    
    if (!sanitizedEmail) {
      return next(errorHandler(400, 'Valid email is required'));
    }
    
    if (!sanitizedPassword) {
      return next(errorHandler(400, 'Password is required'));
    }
    
    // Usar query object explícito para prevenir NoSQL injection
    const query = { 
      email: { $eq: sanitizedEmail }, // Usar $eq operator explícitamente
      isVendor: { $eq: true }
    };
    
    const validVendor = await User.findOne(query).lean();
    
    if (!validVendor) {
      return next(errorHandler(404, "user not found"));
    }
    
    const validPassword = bcryptjs.compareSync(sanitizedPassword, validVendor.password);
    if (!validPassword) {
      return next(errorHandler(404, "wrong credentials"));
    }
   
    const token = Jwt.sign({ id: validVendor._id }, process.env.ACCESS_TOKEN);
    
    // Crear respuesta sin password usando la función helper
    const rest = { ...validVendor };
    delete rest.password;
    
    const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;
    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: thirtyDaysInMilliseconds,
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const vendorSignout = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "vendor signedout successfully" });
  } catch (error) {
    next(error);
  }
};

// vendor login or signup with google - Refactorizada para reducir complejidad
export const vendorGoogle = async (req, res, next) => {
  try {
    const { email, photo, name } = req.body;
    
    // Validar y sanitizar inputs
    const sanitizedEmail = validateAndSanitizeEmail(email);
    const sanitizedName = validateString(name);
    const sanitizedPhoto = validateAndSanitizePhoto(photo);
    
    if (!sanitizedEmail) {
      return next(errorHandler(400, "Invalid email provided"));
    }
    
    // Usar query object explícito para prevenir NoSQL injection
    const query = { 
      email: { $eq: sanitizedEmail }
    };
    
    const user = await User.findOne(query).lean();
    
    // Si el usuario ya existe y es vendor
    if (user?.isVendor) {
      return handleExistingVendor(res, user);
    }
    
    // Si necesita crear nuevo vendor
    if (!sanitizedName) {
      return next(errorHandler(400, "Invalid name provided"));
    }
    
    return await handleNewVendor(res, next, sanitizedEmail, sanitizedName, sanitizedPhoto);
    
  } catch (error) {
    next(error);
  }
};