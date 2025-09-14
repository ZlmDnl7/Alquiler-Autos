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
    
    // Usar destructuring para excluir password sin reasignación
    const { password: _, ...rest } = validVendor;
    
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

// vendor login or signup with google
export const vendorGoogle = async (req, res, next) => {
  try {
    const { email, photo, name } = req.body;
    
    // Validar y sanitizar email
    const sanitizedEmail = validateAndSanitizeEmail(email);
    
    if (!sanitizedEmail) {
      return next(errorHandler(400, "Invalid email provided"));
    }
    
    // Usar query object explícito para prevenir NoSQL injection
    const query = { 
      email: { $eq: sanitizedEmail } // Usar $eq operator explícitamente
    };
    
    const user = await User.findOne(query).lean();
    
    if (user?.isVendor) {
      const { password: _, ...rest } = user;
      const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
        })
        .status(200)
        .json(rest);
    } else {
      // Validar name
      const sanitizedName = validateString(name);
      
      if (!sanitizedName) {
        return next(errorHandler(400, "Invalid name provided"));
      }
      
      // Validar photo URL si se proporciona
      let sanitizedPhoto = null;
      if (photo) {
        const photoString = validateString(photo);
        // Validar que sea una URL válida
        try {
          new URL(photoString);
          sanitizedPhoto = photoString;
        } catch {
          // Si no es una URL válida, usar null
          sanitizedPhoto = null;
        }
      }
      
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      // Generar username único y sanitizado
      const baseUsername = sanitizedName
        .split(" ")
        .join("")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // Remover caracteres especiales
      
      const randomSuffix = 
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      
      const newUser = new User({
        profilePicture: sanitizedPhoto,
        password: hashedPassword,
        username: baseUsername + randomSuffix,
        email: sanitizedEmail,
        isVendor: true,
      });
      
      try {
        const savedUser = await newUser.save();
        const userObject = savedUser.toObject();
     
        const token = Jwt.sign({ id: savedUser._id }, process.env.ACCESS_TOKEN);
        const { password: _, ...rest } = userObject;
        
        res
          .cookie("access_token", token, {
            httpOnly: true,
            expires: expireDate,
          })
          .status(200)
          .json(rest);
      } catch (error) {
        if (error.code === 11000) {
          return next(errorHandler(409, "email already in use"));
        }
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};