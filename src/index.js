import React from 'react';
import ReactDOM from 'react-dom/client'; // Para usar o método createRoot
import App from './App'; // Componente principal da aplicação
import { AuthProvider } from './components/AuthContext'; // Provedor de autenticação
import { BrowserRouter as Router } from 'react-router-dom'; // Router para navegação
import { TimeProvider } from './components/TimeContext'; // Importe o TimeProvider

// Inicializa a raiz do React com ReactDOM.createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza a aplicação com os provedores necessários
root.render(
  <React.StrictMode>
    {/* Router gerencia a navegação da aplicação */}
    <Router>
      {/* AuthProvider gerencia o estado de autenticação */}
      <AuthProvider>
        {/* TimeProvider gerencia o estado do intervalo de tempo */}
        <TimeProvider>
          {/* Componente principal da aplicação */}
          <App />
        </TimeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
