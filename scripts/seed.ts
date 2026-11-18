import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { employees } from "../src/lib/db/schema.ts";
import { sql } from "drizzle-orm";

// Configuration
const TOTAL_RECORDS = 10000;
const BATCH_SIZE = 500;
const SEED = 42; // Fixed seed for deterministic generation

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function createPRNG(seed: number) {
  let s = seed;
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createPRNG(SEED);

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Synthetic Dataset Definitions
const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Vikram", "Pooja",
  "Kenji", "Yuki", "Hiroshi", "Sakura", "Takashi", "Hana", "Daisuke", "Aoi",
  "Lukas", "Emma", "Maximilian", "Hannah", "Felix", "Sophie", "Niklas", "Mia",
  "Liam", "Olivia", "Noah", "Amelia", "Jack", "Charlotte", "Oliver", "Isla",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Sharma", "Patel", "Verma", "Gupta", "Rao", "Reddy", "Nair", "Kulkarni",
  "Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura",
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker",
  "Campbell", "Stewart", "Robertson", "MacDonald", "Tremblay", "Gagnon", "Roy", "Bouchard",
];

interface CountryCurrencyConfig {
  country: string;
  currency: string;
  minSalary: number;
  maxSalary: number;
}

const COUNTRY_CONFIGS: CountryCurrencyConfig[] = [
  { country: "United States", currency: "USD", minSalary: 55000, maxSalary: 185000 },
  { country: "United Kingdom", currency: "GBP", minSalary: 42000, maxSalary: 135000 },
  { country: "Germany", currency: "EUR", minSalary: 48000, maxSalary: 145000 },
  { country: "India", currency: "INR", minSalary: 750000, maxSalary: 3800000 },
  { country: "Canada", currency: "CAD", minSalary: 62000, maxSalary: 175000 },
  { country: "Australia", currency: "AUD", minSalary: 68000, maxSalary: 180000 },
  { country: "Japan", currency: "JPY", minSalary: 5200000, maxSalary: 16500000 },
];

const DEPARTMENT_ROLES: Record<string, string[]> = {
  Engineering: [
    "Software Engineer",
    "Senior Software Engineer",
    "Staff Software Engineer",
    "Engineering Manager",
    "DevOps Engineer",
    "QA Engineer",
    "Site Reliability Engineer",
  ],
  Product: [
    "Product Manager",
    "Senior Product Manager",
    "Product Designer",
    "UI/UX Researcher",
    "Technical Writer",
  ],
  "Human Resources": [
    "HR Generalist",
    "Talent Acquisition Specialist",
    "HR Business Partner",
    "Compensation & Benefits Analyst",
    "People Operations Manager",
  ],
  Finance: [
    "Financial Analyst",
    "Senior Accountant",
    "Payroll Specialist",
    "Finance Director",
    "Tax Analyst",
  ],
  Sales: [
    "Account Executive",
    "Business Development Representative",
    "Sales Operations Manager",
    "Enterprise Account Director",
  ],
  Marketing: [
    "Marketing Specialist",
    "Content Strategist",
    "Growth Marketing Manager",
    "Brand Designer",
  ],
  Operations: [
    "Operations Specialist",
    "Project Coordinator",
    "Supply Chain Manager",
    "Operations Director",
  ],
};

const DEPARTMENTS = Object.keys(DEPARTMENT_ROLES);

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL is not set. Please provide it in .env or environment.");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL database...");
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    console.log(`Starting deterministic seed of ${TOTAL_RECORDS} synthetic employee records...`);

    // Reset strategy: Truncate existing employee records to guarantee exactly 10,000 records upon rerun
    console.log("Applying reset strategy: truncating existing employee records...");
    await pool.query("TRUNCATE TABLE employees RESTART IDENTITY CASCADE;");

    console.log("Generating employee dataset...");
    const records = [];

    for (let i = 1; i <= TOTAL_RECORDS; i++) {
      const countryConfig = COUNTRY_CONFIGS[(i - 1) % COUNTRY_CONFIGS.length];
      const department = pickRandom(DEPARTMENTS);
      const jobTitles = DEPARTMENT_ROLES[department];
      const jobTitle = pickRandom(jobTitles);

      const firstName = pickRandom(FIRST_NAMES);
      const lastName = pickRandom(LAST_NAMES);

      // Formatted employee code: ACM-00001 through ACM-10000
      const employeeCode = `ACM-${String(i).padStart(5, "0")}`;

      // Email guaranteed unique by including employee number; using .synthetic TLD to prevent real-world collisions
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@acme-corp.synthetic`;

      // Deterministic salary generation in realistic range with cent precision
      const baseSalary = randomInt(countryConfig.minSalary, countryConfig.maxSalary);
      const cents = randomInt(0, 99);
      const salaryAmount = `${baseSalary}.${String(cents).padStart(2, "0")}`;

      records.push({
        employeeCode,
        firstName,
        lastName,
        email,
        country: countryConfig.country,
        department,
        jobTitle,
        salaryAmount,
        currency: countryConfig.currency,
      });
    }

    console.log(`Inserting ${TOTAL_RECORDS} records in batches of ${BATCH_SIZE}...`);
    const startTime = Date.now();

    for (let offset = 0; offset < records.length; offset += BATCH_SIZE) {
      const batch = records.slice(offset, offset + BATCH_SIZE);
      await db.insert(employees).values(batch);
      const progress = Math.min(offset + BATCH_SIZE, records.length);
      process.stdout.write(`\rProgress: ${progress}/${TOTAL_RECORDS} employees inserted`);
    }

    const elapsedMs = Date.now() - startTime;
    console.log(`\nSeed completed successfully in ${(elapsedMs / 1000).toFixed(2)}s.`);

    // Verify row count
    const countResult = await pool.query("SELECT COUNT(*) AS total FROM employees;");
    console.log(`Verified total employees in database: ${countResult.rows[0].total}`);
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
