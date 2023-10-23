// Importing modules using ES6 syntax
import passport from "passport";
import passportJwt from "passport-jwt";
import User from "../models/user.js";

const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;

passport.use(
  new StrategyJwt(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwtPayload, done) {
      try {
        const user = await User.findOne({ where: { id: jwtPayload.id } });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;