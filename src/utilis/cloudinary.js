import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloude_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploder.uplode(localFilePath, {
            resource_type: "auto"
        })

        console.log("file is uploded on cloudinary ", response.url);
        return response

    } catch (error) {
        fs.unlink(localFilePath)//remove locally save tempurary file
        return null;

    }
}

export { uploadOnCloudinary }

