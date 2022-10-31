export type Nullable<T> = T | null;

export type CookiesType = Record<string, string | number | boolean>;

export type PossibleContent = number | string | boolean;

export type ContentType = Record<string, Record<string, PossibleContent> | PossibleContent>;

export type Boxed<T> = T | T[];
