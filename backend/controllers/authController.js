import { errorHandler } from "../utils/error.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "Usuario no encontrado"));
    }
    
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Credenciales incorrectas"));
    }
    
    const token = jwt.sign({ id: validUser._id }, process.env.ACCESS_TOKEN);
    const refreshToken = jwt.sign({ id: validUser._id }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
    
    // Actualizar refresh token en la base de datos
    validUser.refreshToken = refreshToken;
    await validUser.save();
    
    const { password: pass, ...rest } = validUser._doc;
    
    res
      .cookie("access_token", token, { httpOnly: true, expires: expireDate })
      .cookie("__refresh_fdbfd9LP", refreshToken, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);
      const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
      
      user.refreshToken = refreshToken;
      await user.save();
      
      const { password: pass, ...rest } = user._doc;
      
      res
        .cookie("access_token", token, { httpOnly: true, expires: expireDate })
        .cookie("__refresh_fdbfd9LP", refreshToken, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      const newUser = new User({
        username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.photo,
        isUser: true,
      });
      
      await newUser.save();
      
      const token = jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN);
      const refreshToken = jwt.sign({ id: newUser._id }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
      
      newUser.refreshToken = refreshToken;
      await newUser.save();
      
      const { password: pass, ...rest } = newUser._doc;
      
      res
        .cookie("access_token", token, { httpOnly: true, expires: expireDate })
        .cookie("__refresh_fdbfd9LP", refreshToken, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return next(errorHandler(401, "Refresh token no proporcionado"));
    }
    
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== token) {
      return next(errorHandler(403, "Refresh token inválido"));
    }
    
    const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
    
    user.refreshToken = newRefreshToken;
    await user.save();
    
    res
      .cookie("access_token", newAccessToken, { httpOnly: true, expires: expireDate })
      .cookie("__refresh_fdbfd9LP", newRefreshToken, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
      .status(200)
      .json({ message: "Tokens actualizados exitosamente" });
  } catch (error) {
    next(error);
  }
};