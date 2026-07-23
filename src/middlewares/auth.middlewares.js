import { User } from "../models/user.model.js";
import { ApiError } from "../utilis/ApiError.js";
import { asyncHandler } from "../utilis/asyncHandler.js";
import jwt from "jsonwebtoken";


export const veryfyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refereshToken")
    
        if (!user) {
            throw new ApiError (401, "Invalid Assess Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        
        throw new ApiError(401, error?.message || "envalid access token")
    }
})
