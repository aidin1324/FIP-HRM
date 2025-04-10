import React from 'react';

// Создаем компоненты-заглушки для react-router-dom
export const Navigate = ({ to, replace, state }) => (
  <div data-testid={`navigate-to-${to.replace(/\//g, '-')}`}>
    Redirecting to {to}
  </div>
);

export const Link = ({ to, children }) => <a href={to}>{children}</a>;

// Создаем контекст для Router
const RouterContext = React.createContext({
  location: { pathname: '/' }
});

// Создаем хук useLocation
export const useLocation = jest.fn().mockReturnValue({
  pathname: '/dashboard',
  search: '',
  hash: '',
  state: null
});

export const useNavigate = jest.fn().mockReturnValue(jest.fn());
export const useParams = jest.fn().mockReturnValue({});

// MemoryRouter компонент
export const MemoryRouter = ({ children, initialEntries = ['/'] }) => {
  const [location, setLocation] = React.useState(initialEntries[0] || '/');
  
  return (
    <RouterContext.Provider value={{ location: { pathname: location } }}>
      {children}
    </RouterContext.Provider>
  );
};

// Routes компонент
export const Routes = ({ children }) => <>{children}</>;

// Route компонент
export const Route = ({ path, element }) => element;

// Экспортируем контекст для тестов
export { RouterContext };