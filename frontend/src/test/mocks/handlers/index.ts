import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://jsonplaceholder.typicode.com/posts', () => {
    return HttpResponse.json([{ id: 1, title: 'Post 1' }]);
  }),
];