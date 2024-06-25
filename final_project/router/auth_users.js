const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];


// Function to check if the username is valid
const isValid = (username)=>{ //returns boolean
  // Checks for the username in the users array
  let user = users.filter((user) => user.username === username);
  // Returns true if the user is found
  if(user.lemgth>0){
    return true;
  }else{
    return false;
  }
}


// Function to check if the user is authenticated
const authenticatedUser = (username,password)=>{ //returns boolean
  // Checks if the user is valid
  let validUsers = users.filter((user) => user.username === username && user.password === password);
  // Returns true if the user is found
  if(validUsers.length>0){
    return true;
  }else{
    return false;
  }
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // If missing username or password, return error
  if(!username || !password){
    return res.status(404).json({message: "Username and password are required"});
  }
  // Check if the user is authenticated
  if (authenticatedUser(username,password)) {
    // Create the token
    const accessToken = jwt.sign({data: password}, "fingerprint_customer", {expiresIn: 60*60});
    // Set the session authorization
    req.session.authorization = {accessToken,username};
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(403).json({message: "Invalid credentials"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get the ISBN, review and username from the request
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  // Check if the book exists
  if (books[isbn]){
    // Add the review to the book
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).json({message: "Review added"});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  // Check if the book exists
  if (books[isbn]) {
    let book = books[isbn];
    delete book.reviews[username];
    return res.status(200).json({message: `${username}'s review deleted`});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
