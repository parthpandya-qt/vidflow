import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import {User} from "../models/users.model.js";
import ApiResponce from "../utils/apiResponse.js";
import upLoadonCloudinary from "../utils/claudinary.js";


const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and refresh token")
    }
}



const registerUser = asyncHandler(async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
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
    const localAvatarPath = req.files?.avatar?.[0]?.path
    const localCoverImagePath = req.files?.coverImage?.[0]?.path
    if (!localAvatarPath){
        throw new ApiError(409, "avatar image is required" )
    }
    const avatar= await upLoadonCloudinary(localAvatarPath)
    const coverImage= await upLoadonCloudinary(localCoverImagePath)

    if(!avatar){
        throw new ApiError(409, "avatar image is required" )
    }
    const user = await User.create({
        userName:userName.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        fullName

    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 , "something went wrong while regestering user")


    }
    return res.status(201).json(new ApiResponce(200 , createdUser , "User registered successfully"))
});


const loginUser = asyncHandler(async (req,res)=>{
// -  req body data
// username or email
// check in database
// password check
// access and refresh token
// send them in secure cookies
const {email,password,userName} = req.body;
    if (!(email || userName)){
        throw new ApiError(400, "username or email is required")

    }
    const user = await User.findOne({
        $or:[{userName},{email}]
    })
    if(!user){
        throw new ApiError(404, "username or email is required")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "invalid user credentials")
    }
    const {refreshToken,accessToken}=await generateAccessAndRefreshTokens(user._id)
    const loggedinUser= await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
    new ApiResponce(
        200,
        {
            user: loggedinUser,
            accessToken,
            refreshToken
        },
        "User logged in successfully"
    )
    );
})
const logoutUser = asyncHandler(async (req,res)=>{

    // create a custom middleware to verify access token and get user details from it and set it in req.user
    // get user id from req.user
    // find user in db and remove refresh token from db
    // clear cookies
    // send response
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set:{refreshToken:undefined}
        },
        {
            new:true
        }
    )

    
    const options = {
        httpOnly: true,
        secure: true
    }    
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponce(200,{},"User logged out"))
    })
    
    


export {registerUser, loginUser, logoutUser}