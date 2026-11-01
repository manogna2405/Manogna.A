
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'books.db');

let db = null;

// GET all books
app.get('/books/', async (request, response) => {
  const books = await db.all('SELECT * FROM book');
  response.send(books);
});

// GET a specific book
app.get('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;

  const book = await db.get(
    'SELECT * FROM book WHERE id = ?',
    [bookId]
  );

  if (book === undefined) {
    response.status(404).send('Book not found');
  } else {
    response.send(book);
  }
});

// POST a new book
app.post('/books/', async (request, response) => {
  const { title, author, price, pages } = request.body;

  if (!title || !author || price == null || pages == null) {
    return response.status(400).send('Required fields are missing');
  }

  const result = await db.run(
    `INSERT INTO book (title, author, price, pages)
     VALUES (?, ?, ?, ?)`,
    [title, author, price, pages]
  );

  response.status(201).send({
    message: 'Book added successfully',
    bookId: result.lastID
  });
});

// PUT to update a book
app.put('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;
  const { title, author, price, pages } = request.body;

  if (!title || !author || price == null || pages == null) {
    return response.status(400).send('Required fields are missing');
  }

  const result = await db.run(
    `UPDATE book
     SET title = ?, author = ?, price = ?, pages = ?
     WHERE id = ?`,
    [title, author, price, pages, bookId]
  );

  if (result.changes === 0) {
    response.status(404).send('Book not found');
  } else {
    response.send('Book updated successfully');
  }
});

// DELETE a book
app.delete('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;

  const result = await db.run(
    'DELETE FROM book WHERE id = ?',
    [bookId]
  );

  if (result.changes === 0) {
    response.status(404).send('Book not found');
  } else {
    response.send('Book deleted successfully');
  }
});

// Initialize database and start server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
