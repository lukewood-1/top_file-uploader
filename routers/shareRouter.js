import { Router } from "express";
import shareCtrl from "../controllers/shareCtrl.js";

const shareRouter = Router();

// shareRouter.get('/file:fileId', shareCtrl.viewSharedFile);
shareRouter.get('/', shareCtrl.viewSharedLink);

export default shareRouter