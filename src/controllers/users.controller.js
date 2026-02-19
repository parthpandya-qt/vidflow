import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import User from "../models/users.model.js";
import ApiResponce from "../utils/apiResponse.js";
import upLoadonCloudinary from "../utils/claudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { userName, email, password, fullName } = req.body;

    if (
        [userName, email, password, fullName]
            .some((field) => !field || field.trim() === "")
    ) {
    throw new ApiError(400, "All fields are required");
    }
    
    const existedUser = await User.findOne({$or: [{ email }, { userName }]});
    if (existedUser) {
        throw new ApiError(409, "User with the same email or username already exists");
    }
    const localAvatarPath = req.files.avatar[0].path
    const localcoverImagePath = req.files.coveraImage[0].path
    if (!localAvatarPath){
        throw new ApiError(409, "avatar image is required" )
    }
    const avatar=upLoadonCloudinary(localAvatarPath)
    const coverImage=upLoadonCloudinary(localcoverImagePath)

    if(!avatar){
        throw new ApiError(409, "avatar image is required" )
    }
    const user = User.create({
        userName:userName.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        fullName

    })
    const createdUser = User.findById(User._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 , "something went wrong while regestering user")


    }
    return res.status(201).json(new ApiResponce(200 , createdUser , "User registered successfully"))
});


export default registerUser;
