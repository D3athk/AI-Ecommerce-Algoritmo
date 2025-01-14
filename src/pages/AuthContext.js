import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Criando o contexto de autenticação
export const AuthContext = createContext();

// Hook para gerenciar autenticação isolada
export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica o status de autenticação baseado no localStorage
  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(storedIsAuthenticated);
  }, []);

  const login = (userName, userId, token) => {
    if (!userName || !userId) {
      console.error('Erro: userName ou userId está faltando no login.');
      return;
    }

    // Armazena os dados no localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('userId', userId);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('token', token);

    // Atualiza o estado de autenticação
    setIsAuthenticated(true);

    // Exibe o alerta de login bem-sucedido
    alert(`Bem-vindo, ${userName}! Login bem-sucedido!`);
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');

    // Atualiza o estado de autenticação
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};

// AuthProvider agora é responsável apenas pelo gerenciamento global do estado de autenticação
export const AuthProvider = ({ children }) => {
  const { isAuthenticated, login, logout } = useAuthState();
  
  const [authState, setAuthState] = useState({
    isLoggedIn: isAuthenticated,
    userName: localStorage.getItem('userName') || '',
  });

  // Função de registro
  const register = async (email, senha, nome) => {
    try {
      const response = await axios.post('http://localhost:5000/register', { email, senha, nome });

      if (response.data?.userName) {
        const { userName } = response.data;

        // Atualiza o estado de autenticação global
        setAuthState({
          isLoggedIn: true,
          userName,
        });

        // Armazena no localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('isLoggedIn', 'true');

        alert('Registro realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      alert(error.response?.data?.message || 'Erro ao tentar registrar. Tente novamente.');
    }
  };

  // Carregar dados do localStorage no início
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setAuthState(prevState => ({
        ...prevState,
        userName: storedUserName,
      }));
    }
  }, []);

  const { isLoggedIn, userName } = authState;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userName,
        login,
        register,
        logout,
        authState,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

