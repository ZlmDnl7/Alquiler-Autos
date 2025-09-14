import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/userModel.js";

// Helper function to extract tokens from headers
const extractTokensFromHeaders = (req) => {
  const authHeader = req.headers.authorization?.split(" ")[1];
  if (!authHeader) return { accessToken: null, refreshTokenValue: null };
  
  const tokens = authHeader.split(",");
  return {
    refreshTokenValue: tokens[0],
    accessToken: tokens[1]
  };
};

// Helper function to extract tokens from cookies
const extractTokensFromCookies = (req) => {
  return {
    accessToken: req.cookies?.access_token || null,
    refreshTokenValue: req.cookies?.__refresh_fdbfd9LP || null
  };
};

// Helper function to get all available tokens
const getTokens = (req) => {
  // Try headers first
  let tokens = extractTokensFromHeaders(req);
  
  // If no tokens in headers, try cookies
  if (!tokens.accessToken && !tokens.refreshTokenValue) {
    tokens = extractTokensFromCookies(req);
  }
  
  return tokens;
};

// Helper function to verify and refresh tokens
const handleRefreshToken = async (refreshTokenValue, next) => {
  try {
    const decoded = jwt.verify(refreshTokenValue, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshTokenValue) {
      return next(errorHandler(403, "Invalid refresh token"));
    }
    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );
    // Update user's refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();
    
    return { userId: decoded.id, success: true };
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Helper function to verify access token
const verifyAccessToken = (accessToken, next) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    return { userId: decoded.id, success: true };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { success: false, expired: true };
    }
    return next(errorHandler(403, "Token is not valid"));
  }
};

// Main middleware function
export const verifyToken = async (req, res, next) => {
  console.log("🔐 VERIFY TOKEN MIDDLEWARE CALLED");
  console.log("📋 Headers:", req.headers);
  console.log("🔑 Authorization:", req.headers.authorization);
  console.log("🍪 Cookies:", req.cookies);
  const { accessToken, refreshTokenValue } = getTokens(req);
  
  console.log("🔑 Access Token:", accessToken ? "✅ Presente" : "❌ Ausente");
  console.log("🔑 Refresh Token:", refreshTokenValue ? "✅ Presente" : "❌ Ausente");
  // Check if any tokens are available
  if (!accessToken && !refreshTokenValue) {
    console.log("❌ NO TOKENS FOUND");
    return next(errorHandler(403, "bad request no tokens provided"));
  }
  // If we have an access token, try to verify it first
  if (accessToken) {
    const accessResult = verifyAccessToken(accessToken, next);
    
    if (accessResult.success) {
      req.user = accessResult.userId;
      return next();
    }
    
    // If access token expired and we have refresh token, continue to refresh logic
    if (!accessResult.expired || !refreshTokenValue) {
      return; // Error already handled in verifyAccessToken
    }
  }
  // Handle refresh token scenario (either no access token or expired access token)
  if (!refreshTokenValue) {
    return next(errorHandler(401, "You are not authenticated"));
  }
  const refreshResult = await handleRefreshToken(refreshTokenValue, next);
  if (refreshResult && refreshResult.success) {
    req.user = refreshResult.userId;
    next();
  }
};