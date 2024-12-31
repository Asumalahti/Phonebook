const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const Person = require('./models/person');
require('dotenv').config();

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

morgan.token('post-data', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return '';
});

const custom = ':method :url :status :res[content-length] - :response-time ms :post-data';
app.use(morgan(custom));


app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error))
    
});


app.delete('/api/persons/:id', (request, response, next) => {

  const id = request.params.id;
  console.log('ID to delete:', id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: 'Invalid ID format' });
  }

  Person.findByIdAndRemove(id)
    .then(result => {
      if (result) {
        response.status(204).end();
      } else {
        response.status(404).json({ error: 'Person not found' });
      }
    })
    .catch(error => {
      console.error('Error deleting person:', error.message);
      next(error);
    });
  });
app.get('/api/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const timeNow = new Date().toString();
      response.send(`<p>Phonebook has info for ${count} people.<br/><br/> ${timeNow}</p>`);
    })
    .catch(error => next(error));
});


app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;

  if (!name || !number) {
    return response.status(400).json({ error: 'name or number missing' });
  }

  Person.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: 'name already taken' });
      }

      const person = new Person({ name, number });

      return person.save();
    })
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error));
});

app.use((request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).json({ error: 'malformatted ID' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  return response.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});