const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        //err.message berasal dari object Error js
        message: err.message,
        stack: err.stack,
    });
};
export default errorHandler;
