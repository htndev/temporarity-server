export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD'
}

export enum Placeholder {
  DoubleWildcard = '**',
  Wildcard = '*',
  Param = ':',
  Word = 'word'
}
