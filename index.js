const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const redis = require('redis');
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  SESSION_SECRET,
  REDIS_URL,
  REDIS_PORT,
} = require('./config/config');

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const app = express();

const mongo_url = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongo_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log('connected to DB'))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.enable('trust proxy');
app.use(cors({}));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUnitialized: false,
      httpOnly: true,
      maxAge: 30 * 1000,
    },
  })
);
app.use(express.json());

app.get('/api/v1/', (req, res) => {
  res.send('<h2>Hi There</h2>');
  console.log('it ran');
});

app.use('/api/v1/posts', postRouter);

app.use('/api/v1/users', userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening to port ${port}`));
