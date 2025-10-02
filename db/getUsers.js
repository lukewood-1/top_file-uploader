import { orm } from "./queries.js";

const demo = async () => {
  const users = await orm.user.findMany();
  console.log('demo users at queries.js: ', users);
}
demo();
