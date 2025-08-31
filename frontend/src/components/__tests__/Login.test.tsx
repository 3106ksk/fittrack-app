
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest'; // vi を追加
import Login from '../Login';

const mockLogin = vi.fn();

vi.mock('../Hook', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);


describe('Login Component', () => {
  

  it('ログインページが正しく表示される', () => {

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '新規アカウント作成' })).toBeInTheDocument();
    
    expect(screen.getByText('FitStarへようこそ')).toBeInTheDocument();
    
    expect(screen.getByTestId('email-field')).toBeInTheDocument();
    expect(screen.getByTestId('password-field')).toBeInTheDocument();
  });

});