/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test('#example Test GET /api/books', function (done) {
    chai
      .request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(
          res.body[0],
          'commentcount',
          'Books in array should contain commentcount'
        );
        assert.property(
          res.body[0],
          'title',
          'Books in array should contain title'
        );
        assert.property(
          res.body[0],
          '_id',
          'Books in array should contain _id'
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite('Routing tests', function () {
    suite(
      'POST /api/books with title => create book object/expect book object',
      function () {
        test('Test POST /api/books with title', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({ title: 'bookTitle1' })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.deepEqual(res.body, {
                title: 'bookTitle1',
                _id: res.body._id,
              });
              done();
            });
        });

        test('Test POST /api/books with no title given', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({ title: '' })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'missing required field title');
              done();
            });
        });
      }
    );

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai
          .request(server)
          .get('/api/books/random')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            const validID = res.body[0]._id
            assert.isString(validID)

            chai
            .request(server)
            .get(`/api/books/${validID}`)
            .end((err, res) => {
              assert.equal(res.status, 200)
              assert.isArray(res.body.comments)
              assert.equal(res.body._id, validID)
              assert.property(res.body, 'title')
              done();
            })  
          })
      });
    });

    suite(
      'POST /api/books/[id] => add comment/expect book object with id',
      function () {
        test('Test POST /api/books/[id] with comment', function (done) {
          chai
          .request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            const validID = res.body[0]._id
            assert.isString(validID)

          chai
            .request(server)
            .post(`/api/books/${validID}`)
            .send({comment: 'testComment'})
            .end((err, res) => {
              assert.equal(res.status, 200)
              assert.equal(res.body._id, validID)
              assert.property(res.body, 'title')
              assert.isString(res.body.title)
              assert(res.body.comments.includes('testComment'))
              done();
            })
          })
        });

        test('Test POST /api/books/[id] without comment field', function (done) {
          chai
            .request(server)
            .post('/api/books/noComment')
            .end((err, res) => {
              assert.equal(res.status, 200)
              assert.equal(res.text, 'missing required field comment')
              done();
            })
        });

        test('Test POST /api/books/[id] with comment, id not in db', function (done) {
          chai
            .request(server)
            .post('/api/books/invalidid')
            .send({comment: 'testComment'})
            .end((err, res) => {
              assert.equal(res.status, 200)
              assert.equal(res.text, 'no book exists')
              done()
            })
        });
      }
    );

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai
        .request(server)
        .get('/api/books')
        .end((err, res) => {
          assert.equal(res.status, 200)
          const validID = res.body[0]._id
          assert.isString(validID)

        chai
          .request(server)
          .delete(`/api/books/${validID}`)
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'delete successful')
            done()
          })
        })
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai
          .request(server)
          .delete('/api/books/invalidid')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done()
          })
      });
    });
  });
});
