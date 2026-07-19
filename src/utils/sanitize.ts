/**
 * Recursively sanitizes object data before Firestore writes by stripping any key
 * with an `undefined` value at any nesting depth.
 * Preserves null values, arrays, Date objects, and Firestore FieldValues (serverTimestamp, arrayUnion, etc).
 */
export const sanitizeFirestoreData = <T extends Record<string, unknown>>(data: T): Record<string, unknown> => {
  const sanitizeValue = (val: unknown): unknown => {
    if (val === undefined) {
      return undefined;
    }
    if (val === null || typeof val !== 'object') {
      return val;
    }
    // Preserve Date instances
    if (val instanceof Date) {
      return val;
    }
    // Preserve special Firestore objects like FieldValue, Timestamp, etc.
    // Standard objects in Firebase JS SDK often have constructor.name === 'FieldValue' or '_methodName' or 'toMillis'
    if (
      val.constructor &&
      (val.constructor.name === 'FieldValue' ||
        val.constructor.name === 'Timestamp' ||
        '_methodName' in val ||
        'toMillis' in val)
    ) {
      return val;
    }
    // Clean arrays recursively
    if (Array.isArray(val)) {
      return val.map(sanitizeValue).filter((item) => item !== undefined);
    }
    // Clean nested plain objects recursively
    const cleanedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const sanitizedV = sanitizeValue(v);
      if (sanitizedV !== undefined) {
        cleanedObj[k] = sanitizedV;
      }
    }
    return cleanedObj;
  };

  return sanitizeValue(data) as Record<string, unknown>;
};
