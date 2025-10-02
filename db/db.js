import { Pool } from "pg";

const database = new Pool({
  connectionString: `${process.env.connectionString}${process.env.dbName}`
});

export default database