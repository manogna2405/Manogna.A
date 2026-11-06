
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, 'books.db');

let db = null;

// Helper function to validate positive book IDs
const isValidId = (id) => {
    return Number.isInteger(Number(id)) && Number(id) > 0;
};

// Initialize database and start server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server Running at http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.log(`Database Error: ${error.message}`);
        process.exit(1);
    }
};

// 1. GET all books with search, sorting, pagination and price filters
app.get('/books', async (request, response) => {
    try {
        const {
            search_q = '',
            order_by = 'id',
            order = 'ASC',
            limit = '10',
            offset = '0',
            min_price,
            max_price,
        } = request.query;

        const allowedColumns = ['id', 'title', 'author', 'price', 'pages'];

        if (
            typeof order_by !== 'string' ||
            !allowedColumns.includes(order_by)
        ) {
            return response.status(400).json({
                message: 'Invalid order_by column',
            });
        }

        if (
            typeof order !== 'string' ||
            !['ASC', 'DESC'].includes(order.toUpperCase())
        ) {
            return response.status(400).json({
                message: 'Order must be ASC or DESC',
            });
        }

        if (typeof search_q !== 'string') {
            return response.status(400).json({
                message: 'Search query must be a string',
            });
        }

        const limitValue = Number(limit);
        const offsetValue = Number(offset);

        if (
            !Number.isInteger(limitValue) ||
            limitValue < 1 ||
            !Number.isInteger(offsetValue) ||
            offsetValue < 0
        ) {
            return response.status(400).json({
                message: 'Invalid limit or offset',
            });
        }

        let query = 'SELECT * FROM book WHERE 1 = 1';
        const params = [];

        // Search books by partial title
        if (search_q.trim() !== '') {
            query += ' AND title LIKE ?';
            params.push(`%${search_q.trim()}%`);
        }

        // Minimum price filter
        if (min_price !== undefined) {
            if (!Number.isFinite(Number(min_price))) {
                return response.status(400).json({
                    message: 'Invalid minimum price',
                });
            }

            query += ' AND price >= ?';
            params.push(Number(min_price));
        }

        // Maximum price filter
        if (max_price !== undefined) {
            if (!Number.isFinite(Number(max_price))) {
                return response.status(400).json({
                    message: 'Invalid maximum price',
                });
            }

            query += ' AND price <= ?';
            params.push(Number(max_price));
        }

        if (
            min_price !== undefined &&
            max_price !== undefined &&
            Number(min_price) > Number(max_price)
        ) {
            return response.status(400).json({
                message: 'Minimum price cannot exceed maximum price',
            });
        }

        // Sorting and pagination
        query += ` ORDER BY ${order_by} ${order.toUpperCase()} LIMIT ? OFFSET ?`;

        params.push(limitValue, offsetValue);

        const books = await db.all(query, params);

        response.status(200).json(books);
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
});

// 2. GET a book by ID
app.get('/books/:bookId', async (request, response) => {
    try {
        const { bookId } = request.params;

        if (!isValidId(bookId)) {
            return response.status(400).json({
                message: 'Invalid book ID',
            });
        }

        const query = 'SELECT * FROM book WHERE id = ?';

        const book = await db.get(query, [Number(bookId)]);

        if (book === undefined) {
            return response.status(404).json({
                message: 'Book not found',
            });
        }

        response.status(200).json(book);
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
});

// 3. POST a new book
app.post('/books', async (request, response) => {
    try {
        const { title, author, price, pages = 0 } = request.body;

        if (
            typeof title !== 'string' ||
            title.trim() === '' ||
            typeof author !== 'string' ||
            author.trim() === '' ||
            price === undefined ||
            price === null ||
            typeof price !== 'number' ||
            !Number.isFinite(price)
        ) {
            return response.status(400).json({
                message: 'Title, author and a valid numeric price are required',
            });
        }

        if (
            typeof pages !== 'number' ||
            !Number.isInteger(pages) ||
            pages < 0
        ) {
            return response.status(400).json({
                message: 'Pages must be a non-negative integer',
            });
        }

        const query = `
            INSERT INTO book (title, author, price, pages)
            VALUES (?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            title.trim(),
            author.trim(),
            price,
            pages,
        ]);

        response.status(201).json({
            message: 'Book added successfully',
            bookId: result.lastID,
        });
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
});

// 4. PUT update an existing book
app.put('/books/:bookId', async (request, response) => {
    try {
        const { bookId } = request.params;
        const { title, author, price, pages } = request.body;

        if (!isValidId(bookId)) {
            return response.status(400).json({
                message: 'Invalid book ID',
            });
        }

        if (
            typeof title !== 'string' ||
            title.trim() === '' ||
            typeof author !== 'string' ||
            author.trim() === '' ||
            price === undefined ||
            price === null ||
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            typeof pages !== 'number' ||
            !Number.isInteger(pages) ||
            pages < 0
        ) {
            return response.status(400).json({
                message: 'Valid title, author, price and pages are required',
            });
        }

        const query = `
            UPDATE book
            SET title = ?, author = ?, price = ?, pages = ?
            WHERE id = ?
        `;

        const result = await db.run(query, [
            title.trim(),
            author.trim(),
            price,
            pages,
            Number(bookId),
        ]);

        if (result.changes === 0) {
            return response.status(404).json({
                message: 'Book not found',
            });
        }

        response.status(200).json({
            message: 'Book updated successfully',
        });
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
});

// 5. DELETE a book
app.delete('/books/:bookId', async (request, response) => {
    try {
        const { bookId } = request.params;

        if (!isValidId(bookId)) {
            return response.status(400).json({
                message: 'Invalid book ID',
            });
        }

        const query = 'DELETE FROM book WHERE id = ?';

        const result = await db.run(query, [Number(bookId)]);

        if (result.changes === 0) {
            return response.status(404).json({
                message: 'Book not found',
            });
        }

        response.status(200).json({
            message: 'Book deleted successfully',
        });
    } catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
});

// Start the server
initializeDBAndServer();
