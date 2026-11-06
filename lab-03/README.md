
# Lab 3: REST API, Query Parameters, Validation and Debugging

## Student Details

- **Name:** Manogna.A
- **Registration Number:** 252U1R8051
- **Section:** S-13 Quantum Engineering 1B
- **College:** Aurora Engineering College
- **Branch:** Artificial Intelligence

## Objective

To develop a RESTful API using Node.js, Express.js and SQLite with search functionality, sorting, pagination, price-range filtering, input validation, appropriate HTTP status codes and error handling.

## Technologies Used

- Node.js
- Express.js
- SQLite
- SQLite3
- Postman
- Nodemon
- JavaScript

## Project Structure

```text
lab-03/
├── screenshots/
├── books.db
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /books | Retrieve all books |
| GET | /books/:bookId | Retrieve a book by ID |
| POST | /books | Add a new book |
| PUT | /books/:bookId | Update an existing book |
| DELETE | /books/:bookId | Delete a book |

## Query Parameters

The GET /books endpoint supports:

| Parameter | Description |
|---|---|
| search_q | Search books by partial title |
| order_by | Select the sorting column |
| order | Sort in ASC or DESC order |
| limit | Set the number of records |
| offset | Skip a specified number of records |
| min_price | Set the minimum price |
| max_price | Set the maximum price |

### Example Requests

**Search:**
```text
GET /books?search_q=Atomic
```

**Sorting:**
```text
GET /books?order_by=price&order=ASC
```

**Pagination:**
```text
GET /books?limit=5&offset=0
```

**Price Range:**
```text
GET /books?min_price=200&max_price=350
```

## Validation and Error Handling

The API validates incoming requests and returns appropriate HTTP status codes.

| Status Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Book created successfully |
| 400 | Invalid input or missing required fields |
| 404 | Requested book not found |
| 500 | Internal server error |

POST validation checks:
- Title must be provided.
- Author must be provided.
- Price must be numeric.
- Pages must be a non-negative integer.

## Testing Using Postman

The following test cases were performed:

1. Retrieve all books.
2. Search books using partial title matching.
3. Sort books by price.
4. Test pagination using limit and offset.
5. Filter books by minimum and maximum price.
6. Retrieve a book using its ID.
7. Test an unavailable book ID.
8. Test an invalid book ID.
9. Add a new book.
10. Validate missing author.
11. Validate non-numeric price.
12. Update an existing book.
13. Delete an existing book.
14. Test deletion of a non-existing book.

## Screenshots

All Postman testing screenshots are available in the `screenshots` folder.

## Conclusion

The REST API was successfully developed and tested using Express.js and SQLite. The application supports CRUD operations, search, sorting, pagination and price-range filtering. Input validation and appropriate HTTP status codes were implemented to handle successful requests and errors consistently.
