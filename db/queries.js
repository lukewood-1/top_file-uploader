import { PrismaClient } from "@prisma/client";

export const orm = new PrismaClient({
    datasourceUrl: `${process.env.connectionString}${process.env.dbName}`
});

const getUsers = async () => { 
  const result = await orm.user.findMany();
  return result
};

const getUser = async userId => {
  const result = await orm.user.findUnique({
    id: userId
  });
  return result
}

const db = {
  getUsers,
  getUser,
}

export default db