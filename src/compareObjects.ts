import { equals } from "ramda";

type On<O> = <K extends keyof O>(key: K, before: O[K], after: O[K]) => void;

export const compareObjects = <O extends Record<string, unknown>>(
    before: O,
    after: O,
    options: {
        onChanged: On<O>;
        onUnchanged: On<O>;
        onAdded: On<O>;
        onRemoved: On<O>;
    }
) => {
    for (const key in before) {
        const beforeValue = before[key];
        const afterValue = after[key];
        if (!afterValue) {
            options.onRemoved(key, beforeValue, afterValue);
            continue;
        }
        if (equals(beforeValue, afterValue)) {
            options.onUnchanged(key, beforeValue, afterValue);
            continue;
        }
        if (!equals(beforeValue, afterValue)) {
            options.onChanged(key, beforeValue, afterValue);
            continue;
        }
    }

    for (const key in after) {
        const beforeValue = before[key];
        const afterValue = after[key];

        if (!beforeValue) {
            options.onAdded(key, beforeValue, afterValue);
        }
    }
};
