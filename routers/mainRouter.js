import { Router } from "express";
import mainCtrl from "../controllers/mainCtrl.js";
import multer from "multer";
import { isAuth } from "../db/passportUtils.js";

const mainRouter = Router();
const storage = multer.diskStorage({
  destination: './public/uploads',
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

mainRouter.post('/switchFileFolder', isAuth, mainCtrl.switchFileFolder);
mainRouter.post('/share', isAuth, mainCtrl.shareFolder);
mainRouter.post('/switchFolderParent', isAuth, mainCtrl.switchFolderParent);
mainRouter.post('/renameFolder', isAuth, mainCtrl.renameFolder);
mainRouter.post('/deleteFolder', isAuth, mainCtrl.deleteFolder);
mainRouter.post('/rename', isAuth, mainCtrl.renameFile);
mainRouter.get('/delete', isAuth, mainCtrl.deleteFile);
mainRouter.post('/delete', isAuth, mainCtrl.deleteFile);
mainRouter.get('/download/file:fileId', mainCtrl.sendClientFile);
mainRouter.get('/explorer/file:fileId', isAuth, mainCtrl.explorerFile);
mainRouter.get('/explorer/dirDetails:dirId', isAuth, mainCtrl.dirStats);
mainRouter.get('/explorer/dir:dirId', isAuth, mainCtrl.explorerDir);
mainRouter.post('/explorer/create-folder', isAuth, mainCtrl.createFolder);
mainRouter.post('/upload', isAuth, upload.single('file'), isAuth, mainCtrl.uploadPagePost);
mainRouter.get('/upload', isAuth, mainCtrl.uploadPageGet);
mainRouter.get('/dashboard', isAuth, mainCtrl.dashboardGet);

export default mainRouter