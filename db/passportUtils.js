import database from "./db.js";
import db from "./queries.js";
import bcrypt from 'bcrypt';
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";

const store = new PrismaSessionStore(
  new PrismaClient(),
  {
    checkPeriod: 1000 * 60 * 2,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }
);

const mySession = {
  store,
  secret: crypto.randomUUID(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
};

async function verify(username, password, done){
  try {
    const { rows } = await database.query('SELECT * FROM "User" WHERE username = $1', [username]);
    const user = rows[0];

    if(!user){
      return done(null, false, {message: 'Incorrect username'});
    }
    const match = bcrypt.compare(user.password, password);
    if(!match){
      return done(null, false, {message: 'Incorrect password'});
    }
    return done(null, user);
  } catch (e) {
    return done(e);
  }
};

const serialize = (user, done) => {
  done(null, user.id)
};

const deserialize = async (id, done) => {
  try {
    const { rows } = await database.query('SELECT * FROM "User" WHERE id = $1', [id]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
}

async function setUpAuth(router){
  router.use(session(mySession));
  router.use(passport.session());

  passport.use(new Strategy(verify));
  passport.serializeUser(serialize);
  passport.deserializeUser(deserialize);
};

async function getUser(req, res, next){
  console.log('session: ', req.session, 'user: ', req.user);
  next();
};

async function isAuth(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect('/access/log-in');
  }
};

export { setUpAuth, verify, serialize, deserialize, getUser, isAuth }