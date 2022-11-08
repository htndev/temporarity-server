export type Nullable<T> = T | null;

export type CookiesType = Record<string, string | number | boolean>;

export type PossibleContent = number | string | boolean;

export type Boxed<T> = T | T[];

export type ContentType = Boxed<Record<string, Record<string, PossibleContent> | PossibleContent>> | string;
