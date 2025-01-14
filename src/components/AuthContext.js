import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importando useNavigate
// Criação do contexto de autenticação
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado inicial com base no localStorage
  const initialAuthState = {
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    userName: localStorage.getItem('userName') || '',
  };
  const navigate = useNavigate(); // Agora o navigate está disponível aqui
  const [authState, setAuthState] = useState(initialAuthState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userName, userId) => {
    // Verifica se userName e userId foram fornecidos
    if (!userName || !userId) {
      console.error('Erro: userName ou userId está faltando no login.');
      return;
    }
  
    // Armazena os dados no localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('userId', userId);
  
    // Atualiza o estado de autenticação
    setAuthState({
      isLoggedIn: true,
      userName,
      userId,
    });
  
    // Marca o usuário como logado no localStorage
    localStorage.setItem('isLoggedIn', 'true');
  
    // Exibe o alerta de login bem-sucedido
    alert(`Bem-vindo, ${userName}! Login bem-sucedido!`);
    
    // Redireciona ou recarrega a página para refletir o login
     // Recarrega a página para atualizar a UI com as novas informações
  };
  // Função de logout
  const logout = () => {
    // Atualiza o estado de autenticação
    setAuthState({ isLoggedIn: false, userName: '', userId: '' });
  
    // Remove os dados de login do localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
  
    // Exibe uma mensagem de logout bem-sucedido (opcional)
    alert('Logout bem-sucedido!');
  
    // Redireciona ou recarrega a página após o logout
    // Exemplo de recarregar a página
    // window.location.reload(); // Ou redirecione para uma página de login
  };
  // Função de registro
  const register = async (email, senha, nome) => {
    try {
      const response = await axios.post('http://localhost:5000/register', { email, senha, nome });

      if (response.data?.userName) {
        const { userName } = response.data;

        setAuthState({
          isLoggedIn: true,
          userName,
        });

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
  // Só executa se   // Este efeito será executado sempre que authState.userName mudar

  const { isLoggedIn, userName, nome } = authState;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userName,
        login,
        nome,
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

export const useAuth = () => useContext(AuthContext);


