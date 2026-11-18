import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { like } from "drizzle-orm";

export const TEST_CODE_PREFIX = "TEST-";

/**
 * Safely removes all test records with the test code prefix.
 * Guaranteed never to modify or delete real seed records (e.g. ACM-00001).
 */
export async function cleanupTestEmployees(): Promise<void> {
  try {
    await db
      .delete(employees)
      .where(like(employees.employeeCode, `${TEST_CODE_PREFIX}%`));
  } catch (error) {
    console.error("Cleanup error in test teardown:", error);
  }
}
