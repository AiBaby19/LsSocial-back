const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const postController = require('./controllers/posts');
const authController = require('./controllers/auth');
const handleErrors = require('./middleware/handleErrors');
const { BadRequest, NotFound, SyntaxError } = require('./utils/error');

const app = express();

require('dotenv').config();
mongoose.set('useCreateIndex', true);

const corsOptions = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/posts', postController);
app.use('/auth', authController);

app.use(handleErrors);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is live at ${PORT}`));

const db = mongoose.connection;
db.on('error', (err) => console.error(`Mongoose connection failed - ${err}`));
db.once('open', () => console.log('Connection established'));

mongoose.connect(
  process.env.MONGO_DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  async () => await console.log('DB ready for use')
);
