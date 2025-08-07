import { handlers } from '@/test/mocks/handlers';
import { setupServer } from 'msw/node';

export const server = setupServer(...handlers);
