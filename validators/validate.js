module.exports.validate = (schema, property = 'body') => {
    return (req, res, next) => {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
      });
  
      if (error) {
        const message = error.details.map(d => d.message).join(', ');
  
        // API requests
        if (req.originalUrl.startsWith('/api')) {
          return res.status(400).json({ error: message });
        }
  
        // Web requests
        req.flash('error', message);
        return res.redirect('back');
      }
  
      req[property] = value;
      next();
    };
  };
  