import { http, HttpResponse } from 'msw';
import { stravaHandlers, stravaHandlersDisconnected } from './strava';

export const handlers = [
  http.get('https://jsonplaceholder.typicode.com/posts', () => {
    return HttpResponse.json([{ id: 1, title: 'Post 1' }]);
  }),
  ...stravaHandlers,
  ...stravaHandlersDisconnected,
];
