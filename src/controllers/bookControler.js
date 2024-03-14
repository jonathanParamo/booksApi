import {
  getAllAvailableBooks,
  reserveBook,
  returnBook,
  createBook,
  getUserReservedBooks,
  getCategoryBooks,
} from '../models/bookModel.js';

export async function createBookController(req, res) {
  const user_id = parseInt(req.params.userId, 10);
  const { title, author, imageBook, description, category } = req.body;
  try {
    const result = await createBook(user_id, title, author, imageBook, description, category);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAllAvailableBooksController(req, res) {
  try {
    const availableBooks = await getAllAvailableBooks();

    if (availableBooks.length === 0) {
      return res.json({ success: true, message: 'There are no available books at the moment' });
    }

    res.json({ success: true, books: availableBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting the available books' });
  }
}

export async function reserveBookController(req, res) {
  const book_id = req.params.bookId;
  const userId = req.params.userId;
  const daysToReserve = req.body.daysToReserve || 7;

  try {
    const result = await reserveBook(book_id, userId, daysToReserve);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reserving the book' });
  }
}

export async function returnBookController(req, res) {
  const userId = parseInt(req.params.userId);
  const bookId = parseInt(req.params.bookId);

  try {
    const result = await returnBook(bookId, userId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Book not available for return') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error while returning book' });
    }
  }
}

export async function getUserReservedBooksController(req, res) {
  const userId = req.params.userId;

  try {
    const reservedBooks = await getUserReservedBooks(userId);
    res.json({ success: true, reservedBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting reserved books' });
  }
}

export async function getCategoryBooksController(req, res) {
  const category = req.params.category;
  try {
    const categoryBooks = await getCategoryBooks(category);
    res.json({ success: true, categoryBooks })
  } catch (error) {
    res.status(500).json({ success: false, message: 'In this moment, is not available books in this category '})
  }
}

