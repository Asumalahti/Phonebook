const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.static('dist'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const morgan = require('morgan')


app.use(express.json())
app.use(morgan('tiny'))

morgan.token('post-data', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return '';
});

const custom =
  ':method :url :status :res[content-length] - :response-time ms :post-data';
app.use(morgan(custom));



app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
  
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id);

    persons = persons.filter(person => person.id !== id)
    
    if (!person) {
      return response.status(404).json({ error: 'Person not found' });
  }
    persons = persons.filter(person => person.id !== id);

    response.status(204).end()
  
})

app.get('/api/info', (request, response) => {
  const timeNow = new Date().toString();
  response.send(`<p>Phonebook has info for ${persons.length} people. <br/><br/> ${timeNow}</p>`)
  
})

const genId = () => {
  const id = Math.floor(Math.random() * 9999);
  return id.toString();
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  }
  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'name already taken' 
    })
  }
  const person = {
    id: genId().toString(),
    name: body.name,
    number: body.number
   
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})