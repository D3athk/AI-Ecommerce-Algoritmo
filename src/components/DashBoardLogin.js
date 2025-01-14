import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
const DashBoardLogin = ({ show, handleClose, setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [userName, setUserName] = useState(""); // Exemplo de definição correta
  // Usuário e senha embutidos (Exemplo de validação simples)
  const VALID_USER = 'jesus';
  const VALID_PASSWORD = 'jesus';

  // Função para tratar o login
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Limpa o erro a cada nova tentativa de login

    // Verifica se as credenciais estão corretas
    if (email === VALID_USER && senha === VALID_PASSWORD) {
      // Se for válido, atualiza o estado e armazena no localStorage
      setIsAuthenticated(true);
      setUserName(userName); // Armazena o nome do usuário, se necessário

      // Armazenamento opcional no localStorage
      localStorage.setItem('userName', JSON.stringify({ userName, isAuthenticated: true }));

      // Fecha o modal após login
      handleClose();
    } else {
      // Se inválido, mostra a mensagem de erro
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login DashBoard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Usuário</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite seu usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="senha" className="mb-3">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Entrar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DashBoardLogin;
