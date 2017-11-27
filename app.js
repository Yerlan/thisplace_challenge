import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/index';
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', router);

app.listen(process.env.PORT || 5000, function () {
  console.log('App is now running!');
});