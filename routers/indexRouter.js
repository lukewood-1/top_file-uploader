import { Router } from "express";
import indexCtrl from "../controllers/indexCtrl.js";
import { isAuth } from "../db/passportUtils.js";

const indexRouter = Router();

indexRouter.get('/', indexCtrl.indexGet);

export default indexRouter