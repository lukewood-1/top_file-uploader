import { Router } from "express";
import accessCtrl from "../controllers/accessCtrl.js";
import passport from "passport";

const accessRouter = Router();

accessRouter.post('/log-in', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/access/log-in'
}));
accessRouter.post('/sign-up', accessCtrl.signUpPost);
accessRouter.get('/log-in', accessCtrl.logInGet);
accessRouter.get('/log-out', accessCtrl.logOutGet);
accessRouter.get('/sign-up', accessCtrl.signUpGet);

export default accessRouter