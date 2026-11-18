import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { like } from "drizzle-orm";

export const TEST_CODE_PREFIX = "TEST-";
export const CRUD_TEST_CODE_PREFIX = "TEST-CRUD-";
export const ANALYTICS_TEST_CODE_PREFIX = "TEST-ANALYTICS-";

/**
 * Safely removes test records matching a given prefix (defaults to TEST-).
 * Guaranteed never to modify or delete real seed records (e.g. ACM-00001).
 */
export async function cleanupTestEmployees(
  prefix: string = TEST_CODE_PREFIX
): Promise<void> {
  // Safety guard: Must begin with TEST- to never delete real seed records
  if (!prefix.startsWith(TEST_CODE_PREFIX)) {
    throw new Error(
      `Safety guard error: cannot cleanup records with non-test prefix '${prefix}'`
    );
  }
  try {
    await db
      .delete(employees)
      .where(like(employees.employeeCode, `${prefix}%`));
  } catch (error) {
    console.error("Cleanup error in test teardown:", error);
  }
}
