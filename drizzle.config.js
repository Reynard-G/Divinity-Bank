import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

export default {
  schema: './drizzle/schema.js',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL,
  },
};
