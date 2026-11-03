import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';
import UserService from '../../service/userService'

jest.mock('../../service/userService', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));


describe('ProfilePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('affiche le loader au début', async () => {
    UserService.getProfile.mockResolvedValueOnce({
      id: 1,
      name: 'Hanane Test',
      email: 'hanane@example.com',
      gender: 'F',
      age: 25,
      city: 'Paris',
      registrationMethod: 'formulaire',
      avatar: null,
    });

    render(<ProfilePage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(await screen.findByDisplayValue(/hanane@example.com/i)).toBeInTheDocument();
  });

  test('affiche les infos du profil et gère Modifier le mot de passe', async () => {
    UserService.getProfile.mockResolvedValueOnce({
      id: 1,
      name: 'Hanane Test',
      email: 'hanane@example.com',
      gender: 'F', // doit correspondre à une des valeurs de <MenuItem value="...">
      age: 25,
      city: 'Paris',
      registrationMethod: 'formulaire',
      avatar: null,
    });

    render(<ProfilePage />);

   
    expect(await screen.findByDisplayValue(/hanane test/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/hanane@example.com/i)).toBeInTheDocument();

    const link = screen.getByRole('button', { name: /modifier le mot de passe/i });
    await userEvent.click(link);

    expect(
      await screen.findByText(/lien pour modifier votre mot de passe/i)
    ).toBeInTheDocument();
  });
});
