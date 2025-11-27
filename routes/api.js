'use strict';

const mongoose = require('mongoose');

module.exports = function (app) {

  mongoose.connect(process.env.DB);

  const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [String]
  });

  const Book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await Book.find({});
        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(formattedBooks);
      } catch (err) {
        res.send('error');
      }
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = new Book({ title: title });
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.send('error');
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.send('error');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        return res.send('missing required field comment');
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        book.comments.push(comment);
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });

};
