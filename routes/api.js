/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  commentcount: { type: Number, default: 0 },
  comments: { type: Array, default: [] },
});
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  app
    .route('/api/books')
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      const books = await Book.find({});
      const booksFiltered = books.map((obj) => ({
        _id: obj._id,
        title: obj.title,
        commentcount: obj.commentcount,
      }));
      return res.json(booksFiltered);
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if (!title || title.length === 0) {
        return res.send('missing required field title');
      }
      const book = new Book({ title });
      try {
        await book.save();
        return res.json({ title: book.title, _id: book._id });
      } catch (err) {
        return res.json({ error: 'could not post' });
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'

      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {}
    });

  app
    .route('/api/books/:id')
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      try {
        const bookById = await Book.findById(bookid);
        if (!bookById) {
          return res.send('no book exists');
        }
        return res.json({
          _id: bookById._id,
          title: bookById.title,
          comments: bookById.comments,
        });
      } catch (err) {
        return res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment || comment.length === 0) {
        return res.send('missing required field comment');
      }

      try {
        const bookById = await Book.findById(bookid);
        if (!bookById) {
          return res.send('no book exists');
        }
        bookById.comments.push(comment);
        bookById.commentcount++;
        await bookById.save();
        return res.json({
          _id: bookid,
          title: bookById.title,
          comments: bookById.comments,
        });
      } catch (err) {
        return res.send('no book exists');
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if(!deletedBook) {
          return res.send('no book exists');
        }
        return res.send('delete successful');
      } catch (err) {
        return res.send('no book exists');
      }
    });
};
