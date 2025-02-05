import { z } from 'zod';

declare const reportValidator: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodObject<{
    runtime_size: z.ZodEffects<z.ZodNumber, number, unknown>;
    init_size: z.ZodEffects<z.ZodNumber, number, unknown>;
    runtime_margin: z.ZodEffects<z.ZodNumber, number, unknown>;
    init_margin: z.ZodEffects<z.ZodNumber, number, unknown>;
}, "strip", z.ZodTypeAny, {
    runtime_size: number;
    init_size: number;
    runtime_margin: number;
    init_margin: number;
}, {
    runtime_size?: unknown;
    init_size?: unknown;
    runtime_margin?: unknown;
    init_margin?: unknown;
}>>, Record<string, {
    runtime_size: number;
    init_size: number;
    runtime_margin: number;
    init_margin: number;
}>, unknown>;
type Report = z.infer<typeof reportValidator>;

export type { Report };
