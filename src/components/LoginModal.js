import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginModal = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');

  const handleLoginClick = () => {
    if (username.trim()) {
      onLogin(username); // Passa o nome de usuário para a função de login
    } else {
      alert('Por favor, insira um nome de usuário.');
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Faça login</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Nome de usuário
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <p>
              Não tem uma conta? <Link to="/register" onClick={onClose}>Cadastre-se aqui</Link>.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleLoginClick}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;