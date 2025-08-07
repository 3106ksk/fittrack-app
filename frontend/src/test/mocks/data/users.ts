export const mockUsers = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const createMockUser = (overrides = {}) => ({
  id: mockUsers.length + 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});