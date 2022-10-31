export const ARRAY_EXAMPLE = [
  '{{repeat()}}',
  {
    id: '{{guid()}}',
    meta: {
      uid: '{{guid()}}',
      user: {
        firstName: '{{firstName()}}',
        lastName: '{{lastName()}}',
        email: '{{email()}}'
      }
    },
    timestamp: '{{date(new Date(2014, 0, 1), new Date())}}',
    category: '{{lorem(1, "words")}}',
    value: '{{lorem(1, "words")}}',
    tags: ['{{repeat(1, 4)}}', '{{lorem(1, "words")}}']
  }
];

export const OBJECT_EXAMPLE = {
  field1: 'value1',
  user: {
    name: '{{firstName()}}',
    tags: ['{{repeat(1, 4)}}', '{{lorem(1, "words")}}']
  },
  timestamp: '{{date(new Date(2014, 0, 1), new Date())}}'
};
