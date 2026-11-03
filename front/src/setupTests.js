import '@testing-library/jest-dom';

jest.mock(
  'react-router-dom',
  () => {
    const React = require('react');
    const navigateMock = jest.fn();

    const Fragment = ({ children }) => React.createElement(React.Fragment, null, children);
    const Anchor = ({ to, href, children, ...rest }) =>
      React.createElement('a', { href: href || (typeof to === 'string' ? to : '#'), ...rest }, children);

    return {
      // hooks
      useNavigate: () => navigateMock,
      useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
      useParams: () => ({}),

      // components (no-op)
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
  { virtual: true } // 👈 important
);

// Polyfills…
class MockIntersectionObserver { observe(){} unobserve(){} disconnect(){} takeRecords(){return []} }
global.IntersectionObserver = global.IntersectionObserver || MockIntersectionObserver;
class MockResizeObserver { observe(){} unobserve(){} disconnect(){} }
global.ResizeObserver = global.ResizeObserver || MockResizeObserver;
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}
(() => {
  const targets = [Element?.prototype, HTMLElement?.prototype, HTMLDivElement?.prototype].filter(Boolean);
  for (const proto of targets) {
    if (!proto.scrollTo) {
      proto.scrollTo = function (optsOrX, y) {
        if (typeof optsOrX === 'object') {
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
        if (typeof optsOrX === 'object') {
          if (typeof optsOrX.left === 'number') this.scrollLeft += optsOrX.left;
          if (typeof optsOrX.top === 'number') this.scrollTop += optsOrX.top;
        } else {
          this.scrollLeft += optsOrX || 0;
          this.scrollTop += y || 0;
        }
      };
    }
  }
})();
window.scrollTo = window.scrollTo || jest.fn();
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || jest.fn();