import { asyncHandler } from "../utilis/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "chai aur code"
    })
})

export { registerUser }; 