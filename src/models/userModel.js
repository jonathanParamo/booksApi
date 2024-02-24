import bcrypt from 'bcrypt';
import pool from '../dbConnections.js';
import db from '../dbConnections.js';
import jwt from 'jsonwebtoken';

export async function createUser(username, password, email) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
       throw new Error('User with this email already exists.');
    }
    const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    const values = [username, hashedPassword, email];

    const [result] = await pool.query(query, values);

    const [newUser] = await pool.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
    const secret = process.env.JWT_SECRET

    const token = jwt.sign({ userId: newUser[0].user_id, username: newUser[0].username }, secret , { expiresIn: '1h' });

    const response = {
      success: true,
      message: 'Registration successful',
      user: newUser[0],
      token,
    };
    return response
  } catch (error) {
    throw new Error('all camps is required')
  }
};

export async function authenticateUser(identifier = '', password,) {
  console.log(password, identifier);
  try {

    const [rows] = await db.query(
      `SELECT
        users.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'book_id', books.book_id,
            'title', books.title,
            'author', books.author,
            'user_id', reservations.user_id
          )
        ) as reserved_books
      FROM users
      LEFT JOIN reservations ON users.user_id = reservations.user_id
      LEFT JOIN books ON reservations.book_id = books.book_id
      WHERE users.username = ? OR users.email = ?
      GROUP BY users.user_id;
    `,
      [identifier, identifier]
    );
    console.log(rows, "rows");

    if (rows.length === 1) {
      const user = rows[0];

      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(passwordMatch);
      const secret = process.env.JWT_SECRET;
      if (passwordMatch) {
        // Check if the user has reservations
        if (user.reserved_book_ids) {
          const reservedBookIds = user.reserved_book_ids.split(',');
          const reservedBookTitles = user.reserved_book_titles.split(',');
          const reservedBookAuthors = user.reserved_book_authors.split(',');

          // Retrieve complete information for each reserved book
          const reservedBooks = reservedBookIds.map((bookId, index) => ({
            book_id: bookId,
            title: reservedBookTitles[index],
            author: reservedBookAuthors[index]
          }));

          const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '1h' });
          const response = {
            success: true,
            reservedBooks,
            userData : {user},
            token,
            message: 'Login successful'
          };

          return response;
        } else {
          // If the user has no reservations, proceed with normal authentication
          const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '1h' });
          const response = {
            success: true,
            user,
            token,
            message: 'Login successful'
          };

          return response;
        }
      } else {
        return { success: false, message: 'Incorrect username or password' };
      }
    } else {
      return { success: false, message: 'Incorrect username or password' };
    }
  } catch (error) {
    return { success: false, message: 'Error during login' };
  }
}


export async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function getUserReservations(userId) {
  try {
    const [reservations] = await pool.query('SELECT * FROM reservations WHERE user_id = ?', [userId]);
    return reservations;
  } catch (error) {
    throw new Error('Error getting user reservations');
  }
}
