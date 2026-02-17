import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userModel = new Schema (
    {
    username : {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true

    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,  //claudinary url
        required:true
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video"

        }
    ],
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    refreshToken:{
        type:String
    }

    },
    {
        timestamps:true
    }

)   
userModel.pre("save", async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10)
    next()
})
userModel.methods.isPasswordCorrect = async function (password){
    return bcrypt.compare(password,this.password)
}
usersModel.methods.generateAccessToken = function (){
    return jwt.sign(
        {id:this._id, username:this.username , email:this.email},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
usersModel.methods.generateRefreshToken = function (){
    return jwt.sign(
        {id:this._id, username:this.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}
export const User = mongoose.model("User",userModel)