module.exports = func => {
    return (req, res, next) => {
        if (typeof func !== 'function') {
            return next(new Error('catchAsync received a non-function'));
        }

        Promise.resolve(func(req, res, next)).catch(next);
    };
};