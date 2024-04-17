import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { db } from '@/lib/db';

await migrate(db, { migrationsFolder: './drizzle' });
