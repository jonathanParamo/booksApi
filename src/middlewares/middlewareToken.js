import jwt from 'jsonwebtoken';

export function verifyTokenMiddleware (req, res, next) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new Error('Token not provided.');
    }

    const [_, token] = authorization.split(' ');

    if (!token) {
      throw new Error('Your session has expired.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Your session has expired.', error: error.message });
  }
};
