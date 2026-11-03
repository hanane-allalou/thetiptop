jest.mock('../../service/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import AuthPage from './AuthPage';

delete window.location;
window.location = { href: '' };

describe('AuthPage', () => {
  const renderWithProviders = (ui) => {
    return render(
      <HelmetProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </HelmetProvider>
    );
  };

  test('affiche le titre Inscription', () => {
    renderWithProviders(<AuthPage />);

    expect(
      screen.getByRole('heading', { name: /inscription/i })
    ).toBeInTheDocument();
  });

  test('ouvre le dialogue de création de compte en cliquant sur S’inscrire', () => {
    renderWithProviders(<AuthPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /s’inscrire/i })[0]);

    expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
  });
});
