const multer = require('multer')

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, './storage')
    },
    filename : (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

module.exports = {
    multer : multer,
    storage : storage
}