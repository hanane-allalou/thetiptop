import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

const renderWithProviders = (ui, { route = '/' } = {}) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </HelmetProvider>
  );

export { renderWithProviders };
