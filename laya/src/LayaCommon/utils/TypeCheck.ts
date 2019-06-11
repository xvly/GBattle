type TypeCheckFunction = (value: any) => boolean;
type OneOfCheckFunction = (value: any, options: any[]) => boolean;
type GetTypeFunction = (value: any) => string;

const getType: GetTypeFunction = (value) => toString.call(value);
export const isNumber: TypeCheckFunction = (value) => value && typeof value === "number" && !isNaN(value);
export const isArray: TypeCheckFunction = (value) => value && Array.isArray(value);
export const isString: TypeCheckFunction = (value) => value && typeof value === "string";
export const isObject: TypeCheckFunction = (value) => value && getType(value) === "[object Object]";

export const isArrayOfString: TypeCheckFunction = (value) =>
    value && isArray(value) && !value.map((val: any) => isString(val)).includes(false);

export const isArrayOfObject: TypeCheckFunction = (value) =>
    value && isArray(value) && !value.map((val: any) => isObject).includes(false);

export const isDefined: TypeCheckFunction = (value) => value !== undefined;
export const isOneOf: OneOfCheckFunction = (value, options) =>
    isArray(options) ? (options as any).includes(value) : false;
