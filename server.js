// Good practice to have everything related to server in one file.
// server.js will be starting file
// it will be there when we listen to server

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// 123. Catching uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('uncaught exception!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' }); // read variables from the file and save them into node js environment variables

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    // returns a promise
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(connection.connections);
    console.log('DB connection successful');
  });
// .catch((err) => console.log('ERROR'));

// console.log(process.env);

// 4) START SERVER
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// 122. Errors outside Express: unhandled rejections
// mongodb error (e.g. when wrong mongodb password)
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);

  // shut down
  // give the server time to finish all the request that are still pending or being handled at the time
  server.close(() => {
    process.exit(1);
  });
});
