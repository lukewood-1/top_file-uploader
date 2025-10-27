import path from 'path';
import url from 'url';
import express from "express";
import indexRouter from './routers/indexRouter.js';
import accessRouter from './routers/accessRouter.js';
import mainRouter from './routers/mainRouter.js';
import { setUpAuth, serialize, deserialize, getUser } from './db/passportUtils.js';
import shareRouter from './routers/shareRouter.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
setUpAuth(app);

app.use('/share', shareRouter);
app.use('/main', mainRouter);
app.use('/access', accessRouter);
app.use('/', indexRouter);

const pathUtil = {
  __dirname,
  __filename
};

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
})

export default pathUtil