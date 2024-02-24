import jwt from 'jsonwebtoken';
import { createUser, authenticateUser, getUserReservations } from '../models/userModel.js';


export async function signupController(req, res) {
  const { username, password, email } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await createUser(username, password, email);
    res.json(result);
  } catch (error) {
    console.error('Error during user signup:', error);

    if (error.message === 'User with this email already exists.') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error during signup.' });
  }
};

export async function signinController(req, res) {
  const { username, password, email } = req.body;

  const userData = await authenticateUser(username, password, email);

  if (userData.success) {
    const token = generateJwtToken(userData.user);
    res.json({userData, token });
  } else {
    res.status(401).json(userData);
  }
}

function generateJwtToken(user) {
  const payload = {
    userId: user.user_id,
    username: user.username,
  };

  const secretKey = process.env.JWT_SECRET;
  const options = {
    expiresIn: '1h',
  };

  return jwt.sign(payload, secretKey, options);
}

export async function getUserReservationsController(req, res) {
  const userId = req.params.userId;

  try {
    const reservations = await getUserReservations(userId);
    res.json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener las reservas' });
  }
}

