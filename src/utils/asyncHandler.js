const asyncHandler = (fn) => async (req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(error.statuscCode || 500).json({
            success:false,
            message:error.message
        })
    }
}
export default asyncHandler;