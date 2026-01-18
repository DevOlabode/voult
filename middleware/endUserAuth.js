const user = await EndUser.findById(decoded.id);

if (!user || !user.isActive) {
  throw new ApiError(
    401,
    'ACCOUNT_DISABLED',
    'Account is disabled or no longer exists'
  );
}

req.user = user;
next();
