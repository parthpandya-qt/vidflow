import mongoose,{Schema} from "mongoose";
const playlistModel = new Schema(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            typr:String,
            required:true
        },
        videos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }],
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistModel)





