import { z } from "zod";

// Official ISO 4217 active three-letter currency code allowlist
export const ISO_4217_CURRENCIES = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD",
  "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS",
  "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR",
  "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD",
  "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU",
  "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK",
  "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG",
  "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK",
  "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL",
  "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH",
  "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD",
  "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL"
] as const;

export type ISO4217Currency = (typeof ISO_4217_CURRENCIES)[number];
const currencySet = new Set<string>(ISO_4217_CURRENCIES);

// Currency validation against authoritative ISO 4217 allowlist
const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((val) => currencySet.has(val), {
    message: "Currency must be a valid ISO 4217 currency code (e.g. USD, EUR, GBP, INR, CAD, JPY)",
  });

/**
 * Salary validation:
 * Accepts decimal strings to strictly preserve financial precision without IEEE 754 floating-point conversion.
 * Validates maximum numeric(12, 2) constraint: up to 10 integer digits and at most 2 decimal places.
 * Ensures the value is strictly positive (> 0).
 */
const salarySchema = z
  .string({
    required_error: "Salary amount is required as a decimal string",
    invalid_type_error: "Salary amount must be a decimal string",
  })
  .trim()
  .regex(
    /^\d{1,10}(\.\d{1,2})?$/,
    "Salary must be a positive decimal string with up to 10 integer digits and at most 2 decimal places (numeric(12, 2))"
  )
  .refine(
    (val) => {
      // Check that the value is strictly positive (> 0) without floating-point conversion
      const [intPart, decPart = ""] = val.split(".");
      const isZero = /^0+$/.test(intPart) && (!decPart || /^0+$/.test(decPart));
      return !isZero;
    },
    {
      message: "Salary must be greater than zero",
    }
  )
  .transform((val) => {
    // Normalize to exact 2-decimal string format purely via string manipulation
    const [intPart, decPart] = val.split(".");
    const cleanInt = intPart.replace(/^0+(?=\d)/, ""); // Trim leading redundant zeros
    if (!decPart) {
      return `${cleanInt}.00`;
    }
    if (decPart.length === 1) {
      return `${cleanInt}.${decPart}0`;
    }
    return `${cleanInt}.${decPart}`;
  });

export const employeeIdSchema = z.object({
  id: z.string().uuid("Invalid employee ID format; must be a valid UUID"),
});

export const createEmployeeSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee code is required")
    .max(32, "Employee code cannot exceed 32 characters"),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .max(255, "Email cannot exceed 255 characters")
    .toLowerCase(),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country cannot exceed 100 characters"),
  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(100, "Department cannot exceed 100 characters"),
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(150, "Job title cannot exceed 150 characters"),
  salaryAmount: salarySchema,
  currency: currencySchema,
});

export const updateEmployeeSchema = createEmployeeSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided for update"
);

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  country: z.string().trim().optional(),
  department: z.string().trim().optional(),
  sortBy: z
    .enum([
      "firstName",
      "lastName",
      "employeeCode",
      "email",
      "salaryAmount",
      "country",
      "department",
      "createdAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryParams = z.infer<typeof employeeQuerySchema>;
