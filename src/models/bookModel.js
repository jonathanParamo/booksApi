import pool from '../dbConnections.js';

export async function getAllAvailableBooks() {
  try {
    const [availableBooks] = await pool.query('SELECT * FROM books WHERE is_available = true');

    return availableBooks;
  } catch (error) {
    throw error;
  }
}

export async function createBook(user_id, title, author, imageBook, description, category) {
  try {
    if (user_id !== 2) {
      throw new Error('Unauthorized: User is not allowed to create books');
    }

    if (!title || !author || !imageBook || !description || !category) {
      throw new Error('All fields are required');
    }

    const insertQuery = 'INSERT INTO books (title, author, image_book, description, days_to_reserve, category) VALUES (?, ?, ?, ?, ?, ?)';
    const insertValues = [title, author, imageBook, description, 0, category];
    const [insertResult] = await pool.query(insertQuery, insertValues);
    const bookId = insertResult.insertId;

    const selectQuery = 'SELECT * FROM books WHERE book_id = ?';
    const [selectResult] = await pool.query(selectQuery, [bookId]);
    const createdBook = selectResult[0];

    return { success: true, message: 'Book created successfully', createdBook };
  } catch (error) {
    throw error;
  }
}

export async function reserveBook(book_id, userId, daysToReserve) {
  try {
    // Check if the book is available
    const [book] = await pool.query('SELECT * FROM books WHERE book_id = ? AND is_available = true', [book_id]);
    if (book.length === 0) {
      return { success: false, message: 'The book is not available for reservation.' };
    }

    // Calculate the expiration date of the reservation
    const reservationDueDate = new Date();
    reservationDueDate.setDate(reservationDueDate.getDate() + daysToReserve);

    // Make the reservation in the 'reservations' table
    const reservationQuery = 'INSERT INTO reservations (user_id, book_id, days_to_reserve, reservation_due_date) VALUES (?, ?, ?, ?)';
    const reservationValues = [userId, book_id, daysToReserve, reservationDueDate];
    await pool.query(reservationQuery, reservationValues);

    // Make the reservation in the 'books' table
    const updateBookQuery = 'UPDATE books SET is_available = false, reserved_by = ?, days_to_reserve = ?, reservation_due_date = ? WHERE book_id = ?';
    const updateBookValues = [userId, daysToReserve, reservationDueDate, book_id];
    await pool.query(updateBookQuery, updateBookValues);

    const [reservedBookInfo] = await pool.query(`
      SELECT
        books.title,
        books.author,
        books.image_book,
        books.*,
        reservations.user_id AS user_id,
        reservations.days_to_reserve,
        reservations.reservation_due_date
      FROM
        books
      LEFT JOIN
        reservations ON books.book_id = reservations.book_id
      WHERE
        books.book_id = ?;
    `, [book_id]);

    return { success: true, message: 'Book reserved successfully', reservedBookInfo: reservedBookInfo[0] };

  } catch (error) {
    throw error;
  }
}

export async function returnBook(bookId, userId) {
  try {
    const [book] = await pool.query('SELECT * FROM books WHERE book_id = ?', [bookId]);
    // Check if the book is currently reserved by the user who is returning it
    if (book.length === 0 || book[0].is_available !== 0 || book[0].reserved_by !== userId) {
      throw new Error('Book not available for return');
    }

    // Return the book and update the related information
    const updateQuery = `
      UPDATE books SET is_available = true,
      days_to_reserve = NULL,
      reservation_due_date = NULL,
      reserved_by = NULL WHERE book_id = ?`;
    const updateValues = [bookId];
    await pool.query(updateQuery, updateValues);

    // Disassociate the reservation from the user in the reservations table
    const deleteReservationQuery = 'DELETE FROM reservations WHERE book_id = ? AND user_id = ?';
    const deleteReservationValues = [bookId, userId];
    await pool.query(deleteReservationQuery, deleteReservationValues);

    const reservedBooksQuery = 'SELECT * FROM books WHERE reserved_by = ?';
    const reservedBooksValues = [userId];
    const reservedBooks = await pool.query(reservedBooksQuery, reservedBooksValues);

    return { success: true, message: 'Book returned successfully', reservedBooks };
  } catch (error) {
    throw error;
  }
}

export async function getUserReservedBooks(userId) {
  try {
    const [reservedBooks] = await pool.query(
      'SELECT b.title, b.author, b.image_book, b.description, r.reservation_date, r.reservation_due_date FROM books b INNER JOIN reservations r ON b.book_id = r.book_id WHERE r.user_id = ?',
      [userId]
    );

    return reservedBooks;
  } catch (error) {
    throw error;
  }
}

export async function getCategoryBooks(category) {
  try {
    const [categories] = await pool.query('SELECT * FROM books WHERE category = ? AND is_available = 1;',
    [category]
    );
    if (categories.length > 0 && Array.isArray(categories)) {
      return categories;
    } else {
      return ('this category not have books');
    }
  } catch (error) {
    throw error;
  }
}
