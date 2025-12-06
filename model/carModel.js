const mongoose = require('mongoose')

const carSchema = new mongoose.Schema({
    carName : {
        type : String,
        required : true
    },
    carBrand : {
        type : String,
        required : true
    },
    carPrice : {
        type : Number,
        required : true
    },
    carImage : {
        type : String,
        required : true
    }
})

const Car = mongoose.model('Car', carSchema)
module.exports = Car