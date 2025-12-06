require('dotenv').config()
const mongoose = require('mongoose')
const CONNECTION_STRING = process.env.CONNECTION_STRING


const connectToDatabase = async () => {
    try {
        await mongoose.connect(CONNECTION_STRING)
        console.log('Database connected successfully')
    } catch (error) {
        console.log("Failed to connect databse", error)
        process.exit(1)
    }
}

module.exports = connectToDatabase