import {
  getAllAvailableBooks,
  reserveBook,
  returnBook,
  createBook,
  getUserReservedBooks
} from '../models/bookModel.js';

export async function createBookController(req, res) {
  const { title, author, imageBook, description } = req.body;

  try {
    const result = await createBook(title, author, imageBook, description);

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


