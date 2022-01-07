import bcrypt from 'bcryptjs';
import passport from 'passport';
import passportLocal from 'passport-local';
import { throwError } from '../helpers/ErrorHandler.helper';
import { User } from '../models/User.model';
import { DatabaseUserInterface, UserInterface } from '../types/api/user';


const LocalStrategy = passportLocal.Strategy;

const getUserInfo = (user) => {
  return {
          id: user.id,
          firstName:user.first_name,
          lastName:user.last_name || undefined,
          email:user.email,
          details:{
            program:user.details?.program || undefined,
            faculty:user.details?.faculty || undefined,
            school:user.details?.school || undefined,
            department:user.details?.department || undefined
          } || undefined,
          phoneNumber:user.phone_number || undefined,
          role:user.role,
          isAdmin:user.is_admin
        };
}

const validateUser = async (email:string,password:string, done) => {
  // console.log('bleh');
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) return done(null, false);
    bcrypt.compare(password, user.password, (err, result: boolean) => {
      if (err) throw err;
      // console.log(result);
      if (result) return done(null, user);
      else return done(null, false);
    });
  } catch (error) {
    console.error(error);
    throwError(400, `Server Error`);
  }
};

const strategy = new LocalStrategy({usernameField:"email",passwordField:"password"},validateUser)


passport.use(strategy);
// ============================================================
// passport serialize and deserialize
// ============================================================
passport.serializeUser((user: DatabaseUserInterface, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findOne({
      where: {
        id:id,
      },
    });
    const userInfo:UserInterface = getUserInfo(user);
    done(null,userInfo);
  } catch (error) {
    done(error)
  }
});

export default passport