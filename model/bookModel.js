const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    bookName : {
        type : String,
        required : true
    },
    bookAuthor : {
        type : String,
        required : true
    },
    bookPrice : {
        type : Number,
        required : true
    },
    bookImage : {
        type : String,
        required : true
    }
})

const Book = mongoose.model('Book', bookSchema)
module.exports = Book