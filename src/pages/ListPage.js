import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import axios from 'axios';

const backgroundStyle = {
  background: `url(/assets/imagem/background2.gif) repeat`,
  backgroundSize: 'auto, cover',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const ListPage = () => {
  const [auth, setAuth] = useState({ isAuthenticated: true });
  const [nome, setNome] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verifica autenticação no carregamento
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setAuth({ isAuthenticated: true });
    }
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/users', {
        params: { nome },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao buscar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Acesso Negado</h1>
        <p>Você não está autenticado. Faça login para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div style={backgroundStyle}>
      <NavigationBar />
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          padding: '20px',
          
          paddingBottom: '100px',
        }}
      >
        <h1>Busca de Usuário</h1>
        <form onSubmit={handleSearch} style={{ marginBottom: '40px' }}>
          <label
            htmlFor="nome"
            style={{ color: 'white', fontSize: '18px', marginRight: '10px' }}
          >
            Nome:
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome do usuário"
            style={{ padding: '8px', fontSize: '16px', width: '250px' }}
          />
          <button
            className="glory"
            type="submit"
            style={{
              padding: '8px 16px',
              marginLeft: '10px',
              fontSize: '16px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Buscar
          </button>
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {users.length > 0 ? (
          <div style={{ margin: '0 auto', width: '80%' }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  backgroundColor: 'transparent',
                  margin: '20px 0',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  textAlign: 'left',
                }}
              >
                <h3 style={{ color: 'white', textAlign: 'center' }}>
                  Usuário {user.id}
                </h3>
                <p>
                  <strong>Nome:</strong> {user.nome}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>CPF:</strong> {user.cpf}
                </p>
                <p>
                  <strong>CEP:</strong> {user.cep}
                </p>
                <p>
                  <strong>Endereço:</strong> {user.endereco}
                </p>
                <p>
                  <strong>Número:</strong> {user.numero}
                </p>
                <p>
                  <strong>Bairro:</strong> {user.bairro}
                </p>
                <p>
                  <strong>Cidade:</strong> {user.cidade}
                </p>
                <p>
                  <strong>Estado:</strong> {user.estado}
                </p>
                <p>
                  <strong>Complemento:</strong> {user.complemento}
                </p>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default ListPage;
