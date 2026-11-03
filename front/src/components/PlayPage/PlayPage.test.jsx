// src/components/PlayPage/PlayPage.test.jsx

// -------------------- 1) Mocks AVANT tout import --------------------
jest.mock(
  'react-router-dom',
  () => {
    const React = require('react');
    const navigateMock = jest.fn();

    const Fragment = ({ children }) =>
      React.createElement(React.Fragment, null, children);

    const Anchor = ({ to, href, children, ...rest }) =>
      React.createElement('a', { href: href || (typeof to === 'string' ? to : '#'), ...rest }, children);

    return {
      // hooks
      useNavigate: () => navigateMock,
      useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
      useParams: () => ({}),

      // composants “no-op”
      MemoryRouter: Fragment,
      BrowserRouter: Fragment,
      Routes: Fragment,
      Route: ({ element }) => element ?? null,
      Link: Anchor,
      NavLink: Anchor,
      Outlet: () => null,
      Navigate: () => null,
    };
  },
  { virtual: true }
);

jest.mock('../../service/prizeService', () => ({
  __esModule: true,
  default: {
    getPrize: jest.fn(),
  },
}));

jest.mock('../../service/participationService', () => ({
  __esModule: true,
  default: {
    createParticipation: jest.fn(),
  },
}));

// -------------------- 2) Imports --------------------
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

import PrizeService from '../../service/prizeService';
import ParticipationService from '../../service/participationService';
import PlayPage from './PlayPage';

// -------------------- 3) Polyfills & environnement jsdom --------------------
class MockIntersectionObserver { observe(){} unobserve(){} disconnect(){} takeRecords(){ return []; } }
global.IntersectionObserver = global.IntersectionObserver || MockIntersectionObserver;

class MockResizeObserver { observe(){} unobserve(){} disconnect(){} }
global.ResizeObserver = global.ResizeObserver || MockResizeObserver;

if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}

window.scrollTo = window.scrollTo || jest.fn();
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || jest.fn();

// scrollTo / scrollBy nécessaires pour le carrousel dans JSDOM
(() => {
  const targets = [Element?.prototype, HTMLElement?.prototype, HTMLDivElement?.prototype].filter(Boolean);
  for (const proto of targets) {
    if (!proto.scrollTo) {
      proto.scrollTo = function (optsOrX, y) {
        if (typeof optsOrX === 'object' && optsOrX !== null) {
          if (typeof optsOrX.left === 'number') this.scrollLeft = optsOrX.left;
          if (typeof optsOrX.top === 'number') this.scrollTop = optsOrX.top;
        } else {
          this.scrollLeft = optsOrX || 0;
          this.scrollTop = y || 0;
        }
      };
    }
    if (!proto.scrollBy) {
      proto.scrollBy = function (optsOrX, y) {
        if (typeof optsOrX === 'object' && optsOrX !== null) {
          if (typeof optsOrX.left === 'number') this.scrollLeft = (this.scrollLeft || 0) + optsOrX.left;
          if (typeof optsOrX.top === 'number') this.scrollTop = (this.scrollTop || 0) + optsOrX.top;
        } else {
          this.scrollLeft = (this.scrollLeft || 0) + (optsOrX || 0);
          this.scrollTop = (this.scrollTop || 0) + (y || 0);
        }
      };
    }
  }
})();

// -------------------- 4) Setup global des tests --------------------
const originalWarn = console.warn;

beforeAll(() => {
  // Masque les warnings “React Router Future Flag”
  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const msg = String(args[0] ?? '');
    if (msg.includes('React Router Future Flag Warning')) return;
    return originalWarn(...args);
  });

  jest.useFakeTimers();
  jest.setTimeout(15000);
});

afterAll(() => {
  console.warn.mockRestore?.();
  jest.useRealTimers();
});

beforeEach(() => {
  localStorage.clear();

  // Données par défaut “heureuses”
  PrizeService.getPrize.mockResolvedValue({
    data: [
      { id: 1, name: 'Mug', imageUrl: 'mug.png' },
      { id: 2, name: 'Thé vert', imageUrl: 'the-vert.png' },
    ],
  });

  ParticipationService.createParticipation.mockResolvedValue({
    data: { prize: { name: 'Mug', imageUrl: 'mug.png' } },
  });
});

// -------------------- 5) Helper de rendu --------------------
const renderWithProviders = (ui) =>
  render(
    <HelmetProvider>
      {ui}
    </HelmetProvider>
  );

// ==================== 6) TESTS ====================
describe('PlayPage — Accessibilité & UX', () => {
  test('structure initiale: rôles/labels essentiels présents', async () => {
    await act(async () => {
      renderWithProviders(<PlayPage />);
      jest.advanceTimersByTime(1000); // avance le timer (countdown / animations)
    });

    const input = await screen.findByLabelText(/numéro de ticket/i);
    expect(input).toBeInTheDocument();

    expect(screen.getByRole('main', { name: /page de jeu concours/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^jouer$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /consulter le règlement du jeu/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lots à gagner/i })).toBeInTheDocument();
  });

  test('aria-invalid + message d’erreur quand on soumet vide', async () => {
    await act(async () => {
      renderWithProviders(<PlayPage />);
      jest.advanceTimersByTime(1000);
    });

    const input = await screen.findByLabelText(/numéro de ticket/i);
    const form = screen.getByRole('form', { name: /formulaire de participation/i });

    await userEvent.clear(input);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    const errors = await screen.findAllByText(/veuillez entrer un numéro de ticket valide/i);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('dialog: ouverture puis fermeture avec Escape, focus revient sur le champ', async () => {
    ParticipationService.createParticipation.mockResolvedValueOnce({
      data: { prize: { name: 'Mug', imageUrl: 'mug.png' } },
    });

    await act(async () => {
      renderWithProviders(<PlayPage />);
      jest.advanceTimersByTime(1000);
    });

    const input = await screen.findByLabelText(/numéro de ticket/i);
    await userEvent.type(input, 'ABCD1234EF');
    const jouer = screen.getByRole('button', { name: /^jouer$/i });

    await act(async () => {
      await userEvent.click(jouer);
    });

    const modalTitle = await screen.findByRole('heading', { name: /félicitations/i });
    expect(modalTitle).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByLabelText(/numéro de ticket/i)).toHaveFocus());
  });

  test('progressbar: attributs ARIA cohérents', async () => {
    await act(async () => {
      renderWithProviders(<PlayPage />);
      jest.advanceTimersByTime(1000);
    });

    await screen.findByLabelText(/numéro de ticket/i);

    const bars = screen.getAllByRole('progressbar');
    const pb = bars[bars.length - 1];

    expect(pb).toHaveAttribute('aria-valuemin', '0');
    expect(pb).toHaveAttribute('aria-valuemax', '100');

    const now = Number(pb.getAttribute('aria-valuenow'));
    expect(now).toBeGreaterThanOrEqual(0);
    expect(now).toBeLessThanOrEqual(100);
  });


  test('soumission: bouton désactivé pendant la requête + modale de succès + fermeture', async () => {
    // success “heureux”
    ParticipationService.createParticipation.mockResolvedValueOnce({
      data: { prize: { name: 'Mug', imageUrl: 'mug.png' } },
    });

    await act(async () => {
      renderWithProviders(<PlayPage />);
      jest.advanceTimersByTime(1000);
    });

    const input = await screen.findByLabelText(/numéro de ticket/i);
    const jouer = screen.getByRole('button', { name: /^jouer$/i });

    await userEvent.type(input, 'ABCD1234EF'); // 10 chars valides
    await userEvent.click(jouer);

    // désactivé pendant la soumission
    expect(jouer).toBeDisabled();

    // service appelé + modale visible
    await waitFor(() => expect(ParticipationService.createParticipation).toHaveBeenCalled());
    const modalTitle = await screen.findByRole('heading', { name: /félicitations/i });
    expect(modalTitle).toBeInTheDocument();

    // on ferme la modale -> formulaire reset (input vide) => bouton désactivé
    const closeButton = screen.getByRole('button', { name: /fermer la fenêtre de résultat/i });
    await userEvent.click(closeButton);

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: /félicitations/i })).not.toBeInTheDocument()
    );
    expect(input).toHaveValue('');
    expect(jouer).toBeDisabled();

    // on retape un code => redevient actif
    await userEvent.type(input, 'ZZZZZZZZZZ');
    await waitFor(() => expect(jouer).not.toBeDisabled());
  });
});