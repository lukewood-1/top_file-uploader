import { Router } from "express";
import mainCtrl from "../controllers/mainCtrl.js";
import multer from "multer";

const mainRouter = Router();
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb){
    const date = new Date(),
      format = num => num >= 10 ? num : '0' + num,
      month = format(date.getMonth()),
      day = format(date.getDate()),
      year = date.getFullYear(),
      hour = format(date.getHours()),
      minute = format(date.getMinutes()),
      second = format(date.getSeconds()),
      filename = file.originalname,
      fieldName = file.fieldname,
      user = req.user.username,
      timestamp = `${user}_${fieldName}-${month}${day}${year}_${hour}${minute}${second}-${filename}`;
    
    cb(null, timestamp)
  }
});
const upload = multer({storage: storage});

mainRouter.post('/', upload.single('file'), mainCtrl.uploadPagePost);
mainRouter.get('/', mainCtrl.uploadPageGet);

export default mainRouter