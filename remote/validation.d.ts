export function isRecord(value: unknown): value is Record<string, unknown>;
export function validateApplication(body: unknown): { app: Record<string, unknown> | null; errors: string[] };
export function validateEnquiry(body: unknown): { enquiry: Record<string, unknown> | null; errors: string[] };
export function validId(value: unknown): value is number;
