import express from 'express';
import {
  signupController,
  signinController,
  getUserReservationsController,
} from '../controllers/userController.js';
import {
  getAllAvailableBooksController,
  createBookController,
  reserveBookController,
  getUserReservedBooksController,
  returnBookController,
} from '../controllers/bookControler.js';
import { verifyTokenMiddleware } from '../middlewares/middlewareToken.js';

const router = express.Router();

router.post('/signup', signupController);
router.post('/signin', signinController);
router.post('/books/create', createBookController);

router.use(verifyTokenMiddleware);

router.get('/books/available', getAllAvailableBooksController);
router.post('/books/:bookId/return/:userId', returnBookController);

router.get('/reservations/:userId', getUserReservationsController);
router.post('/books/:bookId/reserve/:userId', reserveBookController);
router.get('/user/:userId/reserved-books', getUserReservedBooksController);

export default router;