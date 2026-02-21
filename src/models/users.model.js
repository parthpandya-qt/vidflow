import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userModel = new Schema (
    {
    userName : {
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
    password:{
        type:String,
        required:[true, "Password is required"]
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
    
    refreshToken:{
        type:String
    }

    },
    {
        timestamps:true
    }

)   
userModel.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});
userModel.methods.isPasswordCorrect = async function (password){
    return bcrypt.compare(password,this.password)
}
userModel.methods.generateAccessToken = function (){
    return jwt.sign(
        {_id:this._id, userName:this.userName , email:this.email},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userModel.methods.generateRefreshToken = function (){
    return jwt.sign(
        {_id:this._id, userName:this.userName},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}
export const User = mongoose.model("User",userModel)