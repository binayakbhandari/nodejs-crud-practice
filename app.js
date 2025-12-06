
const express = require('express')
const connectToDatabase = require('./database')
const Car = require('./model/carModel')
const { multer, storage } = require('./middleware/multerConfig')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 3000
const upload = multer({storage : storage})
const fs = require('fs').promises
const path = require('path')


// calling connectToDatabase function
connectToDatabase()


// Post API
app.post('/car', (req, res, next) => {
    upload.single('image')
    (req, res, (error) => {
        if(error){
            return res.status(400).json({
                message : "Fail to upload file",
                error : error.message
            })
        }
        next()
    })
}, async (req, res) => {
    try {
        let filename
        if (!req.file) {
            filename = 'https://www.focus2move.com/wp-content/uploads/2018/08/Bugatti-Divo-2019-1.jpg'
        } else {
            filename = `http://localhost:3000/${req.file.filename}`
        }
        const { carName, carBrand, carPrice } = req.body
        if (!carName || !carBrand || !carPrice) {
            return res.status(404).json({
                message : "Please enter all the fields correctly"
            })
        }
        await Car.create({
            carName,
            carBrand,
            carPrice,
            carImage: filename
        })
        res.status(200).json({
            message: "Car created successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Fail to create car",
            error: error.message
        })
    }
})

// Get API
app.get('/car', async (req, res) => {
    try {
        const cars = await Car.find()
        res.status(200).json({
            message: cars.length ? "Cars fetched successfully": "No cars found" ,
            ...(cars.length && {data : cars})
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch cars",
            error: error.message
        })
    }
})

// Get Single API
app.get('/car/:id', async (req, res) => {
    try {
        const { id } = req.params
        const car = await Car.findById(id)
        res.status(car ? 200 : 404).json({
            message : car ? "Car fetched successfully" : "Car not found",
            ...(car && { data : car })
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch car",
            error: error.message
        })
    }
})

// Delete Single API
app.delete('/car/:id', async (req, res) => {
    try {
        const {id} = req.params
        const car = await Car.findById(id)
        if(!car) {
            return res.status(404).json({
                message : "Car not found"
            })
        }
        if (car.carImage.startsWith('http://localhost:3000/')) {
            const filename = car.carImage.replace("http://localhost:3000/", "")
            const filePath = path.join(__dirname, "storage", filename)
            try {
                await fs.unlink(filePath)
                console.log(`File deleted successfully : ${filename}`)
            } catch (error) {
                console.log(`Fail to delete the file : ${error.message}`)
            }
        }
        await Car.findByIdAndDelete(id)
        res.status(200).json({
            message: "Car deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete car",
            error: error.message
        })
    }
})

// Update API
app.patch('/car/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params
        const car = await Car.findById(id)
        if (!car) {
            return res.status(404).json({
                message: "Car not found"
            })
        }
        let filename = car.carImage
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
        const { carName, carBrand, carPrice } = req.body
        await Car.findByIdAndUpdate(id, {
            carName : carName || car.carName,
            carBrand : carBrand || car.carBrand,
            carPrice : carPrice || car.carPrice,
            carImage: filename
        })
        res.status(200).json({
            message: "Car updated successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Fail to update car",
            error: error.message
        })
    }
})





app.use('/storage', express.static('storage'))


app.listen(PORT, ()=> {
    console.log(`NodeJS Project Started on ${PORT} Port`)
})