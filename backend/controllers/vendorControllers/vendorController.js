import User from "../../models/userModel.js";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";
import { errorHandler } from "../../utils/error.js";

const expireDate = new Date(Date.now() + 3600000);

export const vendorSignup = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const hadshedPassword = bcryptjs.hashSync(password, 10);
    // Sanitizar datos de entrada
    const sanitizedUsername = username?.toString().trim();
    const sanitizedEmail = email?.toString().trim();
    
    if (!sanitizedUsername || !sanitizedEmail) {
      return next(errorHandler(400, 'Username and email are required'));
    }
    
    const user = await User.create({
      username: sanitizedUsername,
      password: hadshedPassword,
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
    // Validar que email sea un string
    if (typeof email !== 'string') {
      return next(errorHandler(400, "Invalid email format"));
    }
    
    const sanitizedEmail = email?.toString().trim();
    if (!sanitizedEmail) {
      return next(errorHandler(400, 'Email is required'));
    }
    
    const validVendor = await User.findOne({ email: sanitizedEmail }).lean();
    if (!validVendor?.isVendor) {
      return next(errorHandler(404,"user not found"))
    }
    const validPassword = bcryptjs.compareSync(password, validVendor.password);
    if (!validPassword) {
      return next(errorHandler(404,"wrong credentials"));
    }
   
    const token = Jwt.sign({ id: validVendor._id }, process.env.ACCESS_TOKEN);
    const { password, ...rest } = validVendor;
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

//vendor login or signup with google

export const vendorGoogle = async (req, res, next) => {
  try {
    // Validar y sanitizar el email antes de usarlo en la consulta
    const { email, photo, name } = req.body;
    
    if (!email || typeof email !== 'string') {
      return next(errorHandler(400, "Invalid email provided"));
    }
    
    // Sanitizar el email - solo permitir caracteres válidos para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }
    
    const user = await User.findOne({ email: sanitizedEmail }).lean();
    if (user?.isVendor) {
      const { password, ...rest } = user;
      const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);

      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
        })
        .status(200)
        .json(rest);
    } else {
      // Validar que name sea un string
      if (!name || typeof name !== 'string') {
        return next(errorHandler(400, "Invalid name provided"));
      }
      
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8); //we are generating a random password since there is no password in result
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        profilePicture: photo || null,
        password: hashedPassword,
        username:
          name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8),
        email: email,
        isVendor: true,
        //we cannot set username to req.body.name because other user may also have same name so we generate a random value and concat it to name
        //36 in toString(36) means random value from 0-9 and a-z
      });
      try{
        const savedUser = await newUser.save();
        const userObject = savedUser.toObject();
     
        const token = Jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN);
        const { password, ...rest } = userObject;
        res
          .cookie("access_token", token, {
            httpOnly: true,
            expires: expireDate,
          })
          .status(200)
          .json(rest);
      }
      catch(error){
        if(error.code === 11000){
          return next(errorHandler(409,"email already in use"))
        }
        next(error)
      }
    }
  } catch (error) {
    next(error);
  }
};