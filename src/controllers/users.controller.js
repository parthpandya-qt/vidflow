import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/users.model.js";
import ApiResponce from "../utils/apiResponse.js";
import upLoadonCloudinary from "../utils/claudinary.js";


const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
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
        new ApiResponce(
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
});

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: undefined } },
        { new: true }
    );

    

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponce(
                200,
                {},
                "User logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"unauthorized request")
    }
    if (user.refreshToken!==decodedToken) {
        throw new ApiError(401,"unauthorized request")
    }
    const {accessToken,refreshToken}=generateAccessAndRefreshTokens()
    
    return res
        .satatus(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                { accessToken, refreshToken },
                "Access token refreshed successfully"
            )
        );
})
export { registerUser, loginUser, logoutUser,refreshAccessToken};