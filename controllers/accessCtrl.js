import { body, validationResult } from "express-validator";
import bcrypt from 'bcrypt';
import { orm } from "../db/queries.js"; 

// Error messages for the validation chains
const alphaNumErr = field => `${field} must contain only letters and numbers`;
const alphaErr = field => `${field} must contain only letters`;
const lengthErr = (field, min, max) => `${field} must be between ${min} and ${max} characters long`;

// custom validators
const hasLowercase =  value => {
  if(!/[a-z]/.test(value)) {
    throw new Error('password must contain at least one lowercase letter.');
  }
  return true
};
const hasUppercase =  value => {
  if(!/[A-Z]/.test(value)) {
    throw new Error('password must have at least one uppercase letter');
  }
  return true
};
const hasNumber =  value => {
  if(!/[0-9]/.test(value)){
    throw new Error('password must have at least one number');
  }
  return true
};
const doPasswordsMatch = (value, {req}) => {
  if(value !== req.body.confirmPassword){
    throw new Error('the passwords do not match')
  };

  return true
}

const validate = [
  body('username').trim()
  .notEmpty()
  .isAlphanumeric().withMessage(alphaNumErr('username'))
  .isLength({min: 5, max: 20}).withMessage(lengthErr('username', 5, 20)),
  body('password').trim()
  .notEmpty()
  .isAlphanumeric().withMessage(alphaNumErr('password'))
  .isLength({min: 8, max: 15}).withMessage(lengthErr('password', 8, 15))
  .custom(hasLowercase)
  .custom(hasUppercase)
  .custom(hasNumber),
  body('confirmPassword')
  .custom(doPasswordsMatch)
]

const signUpPost = [
  validate,
  async (req, res, next) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const errors = validationResult(req);

      if(!errors.isEmpty()){
        res.render('sign-up', { errors: errors.array() });
        return;
      }

      const topId = await orm.user.findFirst({
        orderBy: {
          id: 'desc'
        },
        select: {
          id: true
        }
      });
      console.log('topId: ', topId);

      const topFolder = await orm.folder.findFirst();

      const newUser = await orm.user.create({
        data: {
          username: username,
          password: hashedPassword,
        }
      });
      console.log('newUser: ', newUser);

      const newFolder = await orm.folder.create({
        data: {
          name: `${newUser.username}_home`,
          userId: { connect: { id: newUser.id } },
        }
      });
      console.log('newUser folder: ', newFolder);

      res.redirect('/access/log-in');
    } catch (err) {
      console.error(err);
      next(new Error(err));
    }
  }
];

async function logOutGet(req, res, next){
  req.logout( err => {
    if(err){
      return next(err)
    };

    res.redirect('/');
  })
};

const logInGet = (req, res) => {
  res.render('log-in');
}

const signUpGet = (req, res) => {
  res.render('sign-up')
};

const accessCtrl = {
  logInGet,
  logOutGet,
  signUpGet,
  signUpPost
}

export default accessCtrl