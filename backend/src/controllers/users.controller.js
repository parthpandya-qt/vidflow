import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/users.model.js";

import mongoose from "mongoose";
import upLoadonCloudinary from "../utils/claudinary.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinaryByUrl } from "../utils/deletefiles.js";
import  ApiResponse  from "../utils/apiResponse.js";



const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
};
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating tokens"
        );
    }
};



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

    
    if ([userName, email, password, fullName]
        .some(field => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    
    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    
    const localAvatarPath = req.files?.avatar?.[0]?.path;
    const localCoverImagePath = req.files?.coverImage?.[0]?.path;

    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await upLoadonCloudinary(localAvatarPath);

    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar");
    }

    let coverImage;
    if (localCoverImagePath) {
        coverImage = await upLoadonCloudinary(localCoverImagePath);
    }


    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
// -  req body data
// username or email
// check in database
// password check
// access and refresh token
// send them in secure cookies 

    const { userName, email, password } = req.body;

    if (!(email || userName)) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedinUser = await User.findById(user._id)
        .select("-password -refreshToken");

    

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedinUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );
});

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"unauthorized request")
    }
    if (user?.refreshToken!==incomingRefreshToken) {
        throw new ApiError(401,"unauthorized request")
    }
    const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed successfully"
            )
        );
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword,confirmPassword} = req.body;


    if (!(newPassword===confirmPassword)){
        throw new ApiError(400,"password missmatched")
    }
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(400,"invalid old password")
    }
    const isValid = await user.isPasswordCorrect(oldPassword)

    if(!isValid){
        throw new ApiError(400,"invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    
    return res
        .status(200)
        .json( new ApiResponse( 200 ,{} , " password changed"))

})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
        .status(200)
        .json(new ApiResponse( 200 , req.user , "current user fetched successfully"))
})

const updateAccountDetail = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body
    if(!fullName || !email){
        throw new ApiError(400 , "fullname and email is required")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new:true}
    ).select("-password -refreshToken")
    return res
        .status(200)
        .json(new ApiResponse(200, user , "account detail updated"))

    })
    

const updateAvatar = asyncHandler(async(req,res)=>{
    const localAvatarPath = req.file?.path;
    
    
    

    if (!localAvatarPath) {
        throw new ApiError(400 , "local path not found")
    }
    const userfordeletion =  await User.findById(req.user?._id)
    if(!userfordeletion){
        throw new ApiError(400 , "local path not found")
    }
    if(userfordeletion.avatar){
        await deleteFromCloudinaryByUrl(userfordeletion.avatar)
    }
    const avatar = await upLoadonCloudinary(localAvatarPath)

    if (!avatar) {
        throw new ApiError(400, "error in uploading cover image file to claudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}

    ).select("-password -refreshToken")
    return res
        .status(200)
        .json(new ApiResponse(200,user,"avatar updated successfully" ))    
})
const updateCoverImage = asyncHandler(async (req, res) => {

    const localCoverImagePath = req.file?.path;

    if (!localCoverImagePath) {
        throw new ApiError(400, "Cover image file not found");
    }

    const existingUser = await User.findById(req.user._id);

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    
    const coverImage = await upLoadonCloudinary(localCoverImagePath);

    if (!coverImage?.url) {
        throw new ApiError(500, "Error uploading cover image");
    }


    if (existingUser.coverImage) {
        await deleteFromCloudinaryByUrl(existingUser.coverImage);
    }

    existingUser.coverImage = coverImage.url;
    await existingUser.save();

    return res.status(200).json(
        new ApiResponse(200, existingUser, "Cover image updated successfully")
    );
});


const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {userName} = req.params
    if(!userName?.trim()){
        throw new ApiError(400 , "user not found ")
    }

    const channel = await User.aggregate([
        {
            $match:{
                userName:userName?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                subscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                },
                

            }
        },
        {
            $project:{
                userName:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                fullName:1,
                email:1,
                avatar:1,
                coverImage:1
            }
        }
        
    ])
    if(!channel?.length){
        throw new ApiError(400,"user not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200,channel[0],"uchannel fetched successfully"))


})

const getUserwatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[{
                            $project:{
                                userName:1,
                                avatar:1,
                                fullName:1

                            }
                        }]
                    }
                },
            {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }]
            }
            
            
        }
        
    ])
    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"))
})
export { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getUserwatchHistory};