
const express = require('express')
const connectToDatabase = require('./database')
const Book = require('./model/bookModel')
const { multer, storage } = require('./middleware/multerConfig')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 3000
const upload = multer({ storage: storage })
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')
app.use(express.json())

// Cors configuration
app.use(cors({
    origin: ['http://localhost:5173']
}))


// calling connectToDatabase function
connectToDatabase()


// Post API
app.post('/book', (req, res, next) => {
    upload.single('bookImage')
        (req, res, (error) => {
            if (error) {
                return res.status(400).json({
                    message: "Fail to upload file",
                    error: error.message
                })
            }
            next()
        })
}, async (req, res) => {
    try {
        let filename
        if (!req.file) {
            filename = 'https://readersspacenepal.com/wp-content/uploads/2023/01/psychology-of-money.jpg'
        } else {
            filename = `http://localhost:3000/${req.file.filename}`
        }
        const { bookName, bookAuthor, bookPrice, bookSubtitle } = req.body
        if (!bookName || !bookAuthor || !bookPrice) {
            return res.status(404).json({
                message: "Please enter all the fields correctly"
            })
        }
        await Book.create({
            bookName,
            bookAuthor,
            bookPrice,
            bookSubtitle,
            bookImage: filename
        })
        res.status(200).json({
            message: "Book created successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Fail to create book",
            error: error.message
        })
    }
})

// Get API
app.get('/book', async (req, res) => {
    try {
        const books = await Book.find()
        res.status(200).json({
            message: books.length ? "Books fetched successfully" : "No books found",
            ...(books.length && { data: books })
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch books",
            error: error.message
        })
    }
})

// Get Single API
app.get('/book/:id', async (req, res) => {
    try {
        const { id } = req.params
        const book = await Book.findById(id)
        res.status(book ? 200 : 404).json({
            message: book ? "Book fetched successfully" : "Book not found",
            ...(book && { data: book })
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch book",
            error: error.message
        })
    }
})

// Delete Single API
app.delete('/book/:id', async (req, res) => {
    try {
        const { id } = req.params
        const book = await Book.findById(id)
        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            })
        }
        if (book.bookImage.startsWith('http://localhost:3000/')) {
            const filename = book.bookImage.replace("http://localhost:3000/", "")
            const filePath = path.join(__dirname, "storage", filename)
            try {
                await fs.unlink(filePath)
                console.log(`File deleted successfully : ${filename}`)
            } catch (error) {
                console.log(`Fail to delete the file : ${error.message}`)
            }
        }
        await Book.findByIdAndDelete(id)
        res.status(200).json({
            message: "Book deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete book",
            error: error.message
        })
    }
})

// Update API
app.patch('/book/:id', upload.single('bookImage'), async (req, res) => {
    try {
        const { id } = req.params
        const book = await Book.findById(id)
        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            })
        }
        let filename = book.bookImage
        if (req.file) {
            if (filename.startsWith('http://localhost:3000/')) {
                const oldFileName = filename.replace("http://localhost:3000/", "")
                const filepath = path.join(__dirname, "storage", oldFileName)
                try {
                    await fs.unlink(filepath)
                    console.log(`File deleted successfully : ${filename}`)
                } catch (error) {
                    console.log(`Fail to delete the file : ${error.message}`)
                }
            }
            filename = `http://localhost:3000/${req.file.filename}`
        }
        const { bookName, bookAuthor, bookPrice, bookSubtitle } = req.body
        await Book.findByIdAndUpdate(id, {
            bookName: bookName || book.bookName,
            bookSubtitle: bookSubtitle || book.bookSubtitle,
            bookAuthor: bookAuthor || book.bookAuthor,
            bookPrice: bookPrice || book.bookPrice,
            bookImage: filename
        })
        res.status(200).json({
            message: "Book updated successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Fail to update book",
            error: error.message
        })
    }
})


app.use('/', express.static('storage'))


app.listen(PORT, () => {
    console.log(`NodeJS Project Started on ${PORT} Port`)
})