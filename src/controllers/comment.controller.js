import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(15, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })      // latest comments first
        .skip(skip)
        .limit(limitNumber)
        .lean();

    return res.status(200).json(
        new ApiResponce(
            200,
            comments,
            "Video comments fetched successfully"
        )
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }
    const comment = await Comment.create(
        {
            content:content.trim(),
            video:videoId,
            owner:req.user?._id
        }
    )
    if(!comment){
        throw new ApiError(500,"error in server side")
    }
    return res
            .status(200)
            .json(new ApiResponce(200, comment , "comment created successfully"))

    
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        { content: content.trim() },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or not authorized");
    }

    return res.status(200).json(
        new ApiResponce(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const{commentId}=req.params
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400 , "commentid needed")
    }
    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: req.user._id
        }
    )
    if (!deletedComment) {
        throw new ApiError(404 , "error in deleting the comment")
    }
    return res
            .status(200)
            .json(new ApiResponce(
                200,
                {
                    success:true
                },
                "comment deleted successsfully"
            ))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }