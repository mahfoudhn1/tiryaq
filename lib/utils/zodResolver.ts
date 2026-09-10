import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Minimal Zod <-> React Hook Form resolver.
 *
 * Avoids pulling in @hookform/resolvers for the handful of forms in this app.
 * Maps Zod issues onto RHF's error shape, keyed by dot-joined field path.
 */
export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }

    return { values: {}, errors } as ReturnType<Resolver<T>> extends Promise<infer R> ? R : never;
  };
}
