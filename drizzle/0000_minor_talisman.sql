CREATE TABLE IF NOT EXISTS "AccountTypes" (
	"name" text PRIMARY KEY NOT NULL,
	"interest_rate" numeric NOT NULL,
	"transaction_fee" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PaymentTypes" (
	"name" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Roles" (
	"name" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionStatuses" (
	"name" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionTypes" (
	"name" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"fee" numeric DEFAULT 0 NOT NULL,
	"transaction_type" text NOT NULL,
	"payment_type" text NOT NULL,
	"attachment" text,
	"note" text,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_type" text NOT NULL,
	"minecraft_uuid" text,
	"minecraft_username" text,
	"discord_username" text,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_created_by_user_id_Users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_transaction_type_TransactionTypes_name_fk" FOREIGN KEY ("transaction_type") REFERENCES "TransactionTypes"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_payment_type_PaymentTypes_name_fk" FOREIGN KEY ("payment_type") REFERENCES "PaymentTypes"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_status_TransactionStatuses_name_fk" FOREIGN KEY ("status") REFERENCES "TransactionStatuses"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Users" ADD CONSTRAINT "Users_account_type_AccountTypes_name_fk" FOREIGN KEY ("account_type") REFERENCES "AccountTypes"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
