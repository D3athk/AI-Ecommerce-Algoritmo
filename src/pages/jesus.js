export const isUserAuthenticated = () => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  };