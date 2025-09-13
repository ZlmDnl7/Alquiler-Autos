import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import Jwt from "jsonwebtoken";

const expireDate = new Date(Date.now() + 3600000);

export const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return next(errorHandler(400, "El email ya está registrado"));
      }
      if (existingUser.username === username) {
        return next(errorHandler(400, "El nombre de usuario ya está en uso"));
      }
    }
    
    const hashedPassword = bcryptjs.hashSync(password, 10);
    
    // Solo incluir campos que se proporcionen
    const userData = {
      username,
      email,
      password: hashedPassword,
      isUser: true,
    };
    
    // Solo agregar phoneNumber si se proporciona
    if (req.body.phoneNumber && req.body.phoneNumber.trim() !== '') {
      userData.phoneNumber = req.body.phoneNumber.trim();
    }
    
    const newUser = new User(userData);
    
    await newUser.save();
    res.status(200).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    console.error("Error en signUp:", error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' ? 'El email ya está registrado' : 
                     field === 'username' ? 'El nombre de usuario ya está en uso' :
                     'Error de duplicado en el sistema';
      return next(errorHandler(400, message));
    }
    
    next(error);
  }
};

// Refresh Tokens
export const refreshToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(errorHandler(403, "Bad request: no authorization header provided"));
  }
  
  const authParts = req.headers.authorization.split(" ")[1]?.split(",");
  
  if (!authParts || authParts.length < 2) {
    return next(errorHandler(400, "Invalid authorization header format"));
  }
  
  const refreshToken = authParts[0];
  const accessToken = authParts[1];
  
  console.log('Refresh token:', refreshToken);
  console.log('Access token:', accessToken);
  
  if (!refreshToken) {
    return next(errorHandler(401, "You are not authenticated"));
  }
  
  try {
    const decoded = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);
    
    if (!user) return next(errorHandler(403, "Invalid refresh token"));
    
    if (user.refreshToken !== refreshToken) {
      return next(errorHandler(403, "Invalid refresh token"));
    }
    
    const newAccessToken = Jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    
    const newRefreshToken = Jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );
    
    // Update the refresh token in the database for the user
    await User.updateOne({ _id: user._id }, { refreshToken: newRefreshToken });
    
    res
      .cookie("access_token", newAccessToken, {
        httpOnly: true,
        maxAge: 900000,
        sameSite: "None",
        secure: true,
        domain: "localhost",
      }) // 15 minutes
      .cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        maxAge: 604800000,
        sameSite: "None",
        secure: true,
        domain: "localhost",
      }) // 7 days
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Error in refreshToken:', error.message);
    next(errorHandler(500, "Error in refreshToken controller"));
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));
    
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials"));
    
    const accessToken = Jwt.sign(
      { id: validUser._id }, 
      process.env.ACCESS_TOKEN, 
      { expiresIn: "15m" }
    );
    
    const refreshToken = Jwt.sign(
      { id: validUser._id }, 
      process.env.REFRESH_TOKEN, 
      { expiresIn: "7d" }
    );
    
    const updatedData = await User.findByIdAndUpdate(
      { _id: validUser._id },
      { refreshToken },
      { new: true }
    );
    
    // Separating password from the updatedData - no unused variable
    const { password: _, isAdmin, ...rest } = updatedData._doc;
    
    const responsePayload = {
      refreshToken: refreshToken,
      accessToken,
      isAdmin,
      ...rest,
    };
    
    req.user = {
      ...rest,
      isAdmin: validUser.isAdmin,
      isUser: validUser.isUser,
    };
    
    res.status(200).json(responsePayload);
    next();
  } catch (error) {
    console.error('Error in signIn:', error.message);
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).lean();
    
    if (user && !user.isUser) {
      return next(errorHandler(409, "Email already in use as a vendor"));
    }
    
    if (user) {
      // Remove password from user object - no unused variable
      const { password: _, ...rest } = user;
      const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);
      
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          sameSite: "None",
          secure: true,
          domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      const newUser = new User({
        profilePicture: req.body.photo,
        password: hashedPassword,
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        isUser: true,
      });
      
      const savedUser = await newUser.save();
      const userObject = savedUser.toObject();
      const token = Jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN);
      
      // Remove password from user object - no unused variable
      const { password: _, ...rest } = userObject;
      
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          sameSite: "None",
          secure: true,
          domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    console.error('Error in google auth:', error.message);
    next(error);
  }
};