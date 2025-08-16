import { server } from '@/test/mocks/server';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});