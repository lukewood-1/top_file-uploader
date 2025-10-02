import { Router } from "express";
import indexCtrl from "../controllers/indexCtrl.js";
import multer from "multer";

const indexRouter = Router();
const upload = multer({dest: '../uploads/'});

indexRouter.get('/', indexCtrl.indexGet);
indexRouter.post('/upload', upload.single('file'), indexCtrl.uploadPagePost);

export default indexRouter