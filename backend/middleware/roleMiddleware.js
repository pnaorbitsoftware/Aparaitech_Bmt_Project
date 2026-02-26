module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - No user found"
      });
    }

    const userRole = String(req.user.role).toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden - You do not have permission"
      });
    }

    next();
  };
};
