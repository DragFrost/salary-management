CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_code" varchar(32) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"department" varchar(100) NOT NULL,
	"job_title" varchar(150) NOT NULL,
	"salary_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "employees_employee_code_uidx" ON "employees" USING btree ("employee_code");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_email_uidx" ON "employees" USING btree ("email");--> statement-breakpoint
CREATE INDEX "employees_country_idx" ON "employees" USING btree ("country");--> statement-breakpoint
CREATE INDEX "employees_department_idx" ON "employees" USING btree ("department");--> statement-breakpoint
CREATE INDEX "employees_currency_idx" ON "employees" USING btree ("currency");--> statement-breakpoint
CREATE INDEX "employees_name_idx" ON "employees" USING btree ("last_name","first_name");