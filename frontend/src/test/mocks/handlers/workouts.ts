import { http, HttpResponse } from 'msw';

export const workoutsHandlers = [
  http.post('http://localhost:8000/workouts', async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;

    return HttpResponse.json(
      {
        message: 'ワークアウトが正常に作成されました',
        workout: {
          id: 1,
          userID: 1,
          date: new Date().toISOString().split('T')[0],
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }),
];
