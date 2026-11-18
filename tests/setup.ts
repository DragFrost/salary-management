import { beforeAll, afterAll } from "vitest";

// Helper to extract and normalize host, port, and database name from a PostgreSQL connection string
function parsePostgresDatabaseTarget(urlString: string) {
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();
    const port = parsed.port || "5432";
    const database = parsed.pathname.replace(/^\//, "").toLowerCase();
    return { host, port, database };
  } catch {
    return null;
  }
}

// 1. Mandatory TEST_DATABASE_URL: Fail immediately with clear setup error if missing
const testDbUrl = process.env.TEST_DATABASE_URL;

if (!testDbUrl || !testDbUrl.trim()) {
  throw new Error(
    "\n========================================================================\n" +
    "FATAL CONFIGURATION ERROR: TEST_DATABASE_URL is required to run tests.\n" +
    "Tests are strictly forbidden from running against the development database.\n" +
    "Please configure TEST_DATABASE_URL in your environment or .env file:\n" +
    "  TEST_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acme_salary_test\n" +
    "========================================================================\n"
  );
}

// 2. Reject configuration if TEST_DATABASE_URL and DATABASE_URL resolve to the same database
const devDbUrl = process.env.DATABASE_URL;
if (devDbUrl && devDbUrl.trim()) {
  if (testDbUrl.trim() === devDbUrl.trim()) {
    throw new Error(
      "\n========================================================================\n" +
      "FATAL ISOLATION ERROR: TEST_DATABASE_URL cannot match DATABASE_URL.\n" +
      "Running tests against the active development database risks corrupting\n" +
      "the 10,000-employee development dataset. Use a dedicated test database.\n" +
      "========================================================================\n"
    );
  }

  const testTarget = parsePostgresDatabaseTarget(testDbUrl);
  const devTarget = parsePostgresDatabaseTarget(devDbUrl);

  if (testTarget && devTarget) {
    const normalizeHost = (h: string) =>
      h === "localhost" || h === "127.0.0.1" ? "127.0.0.1" : h;

    const sameHost = normalizeHost(testTarget.host) === normalizeHost(devTarget.host);
    const samePort = testTarget.port === devTarget.port;
    const sameDb = testTarget.database === devTarget.database;

    if (sameHost && samePort && sameDb) {
      throw new Error(
        "\n========================================================================\n" +
        `FATAL ISOLATION ERROR: TEST_DATABASE_URL and DATABASE_URL identify the same\n` +
        `PostgreSQL database ('${testTarget.database}') on ${testTarget.host}:${testTarget.port}.\n` +
        `Tests must run against a distinct test database (e.g. acme_salary_test)\n` +
        `to prevent deleting or altering the 10,000-employee development seed.\n` +
        "========================================================================\n"
      );
    }
  }
}

// 3. Initialize test connection target from TEST_DATABASE_URL before application modules load
process.env.DATABASE_URL = testDbUrl.trim();

beforeAll(async () => {
  // Global test lifecycle initialization
});

afterAll(async () => {
  // Global test lifecycle teardown
});
