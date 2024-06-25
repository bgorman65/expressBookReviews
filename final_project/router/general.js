const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: `${username} successfully registered. Now you can login`});
      } else {
          return res.status(400).json({message: `${username} already exists!`});
      }
  }else{
      return res.status(404).json({message: "Username and password are required"});
  }
});


// Function to get the book list with promise
function getBooks() {
  return new Promise((resolve, reject) => {
      resolve(books);
  });
}


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  try {
      getBooks().then((books) => {
          res.send(JSON.stringify(books));
      });
  } catch (error) {
      res.status(500).json({message: "Internal server error"});
  }
});


// Function to get book details based on ISBN with promise
function getByISBN(isbn) {
  return new Promise((resolve, reject) => {
      let isbnNum = parseInt(isbn);
      if (books[isbnNum]) {
          resolve(books[isbnNum]);
      } else {
          reject({status:404, message:`ISBN ${isbn} not found`});
      }
  });
}



// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Get the ISBN from the request
  const isbn = req.params.isbn;
  // Get the book from the books object
  getByISBN(isbn).then((book) => {
      res.send(JSON.stringify(book));
  }).catch((error) => {
      res.status(error.status).json({message: error.message});
  });
 });
  
 
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Get the author from the request
  const author = req.params.author;
  // Get the books by author through promise
  // Can use getBooks function already made in step 10
  getBooks().then((bookEntries) => Object.values(bookEntries))
  .then((books) => books.filter((book) => book.author === author))
  .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    // Get the title from the request
    const title = req.params.title;
    // Get the books by title through promise
    // Can use getBooks function already made in step 10
    getBooks().then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Get the ISBN from the request
  const isbn = req.params.isbn;
  // Get the book from the books object
  const book = books[isbn];
  // If book is found, return reviews
  if (book) {
      res.send(JSON.stringify(book.reviews));
  } else {
      res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
