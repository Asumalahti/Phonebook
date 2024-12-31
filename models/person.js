const mongoose = require('mongoose')
require('dotenv').config()
//if (process.argv.length<3) {
//  console.log('give password as argument')
//  process.exit(1)
//}

const password = process.env.MONGODB_PASSWORD
const personName = process.argv[3]
const personNumber = process.argv[4]

const url = process.env.MONGODB_URI
console.log('connecting to', url)

console.log('Starting the script...')
mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{2,3}-[0-9]{6,10}$/.test(v)
      },
      message: props => `${props.value} not a valid number`
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)