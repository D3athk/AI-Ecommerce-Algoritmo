import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavigationBar from '../components/NavigationBar';

const backgroundStyle = {
  background: `url(/assets/imagem/background2.gif) repeat`,
  backgroundSize: 'auto, cover',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const KeysPage = () => {
  const [mercadoPagoKey, setMercadoPagoKey] = useState('');
  const [correiosKey, setCorreiosKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Carregar as chaves atuais ao montar o componente
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await axios.get('http://localhost:5000/jeova', {
          headers: { 'Content-Type': 'application/json' },  // Cabeçalhos podem ser passados aqui
        });

        // A resposta vem como um array com um único objeto
        const { mercadoPagoKey, correiosKey } = response.data[0];
        setMercadoPagoKey(mercadoPagoKey);
        setCorreiosKey(correiosKey);
      } catch (error) {
        setMessage('Erro ao carregar as chaves');
      }
    };
  
    fetchKeys();
  }, []);
  
  const handleSave = async () => {
    setLoading(true);
  
    try {
      await axios.put(
        'http://localhost:5000/jeova',  // Certifique-se de que a URL está correta
        { mercadoPagoKey, correiosKey },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert('Chaves atualizadas com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar as chaves');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={backgroundStyle}>
      <NavigationBar />
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h1><strong>Editar API Keys</strong> </h1>
        <div style={{ marginBottom: '15px' }}>
        <img
  src='assets/imagem/mercadopago.png'
  width={'100px'}
  height={'100px'}
  style={{ display: 'block', margin: '0 auto' }}
  className='img-fluid'
/>          <label style={{ display: 'block', marginBottom: '5px', color:'white' }}><strong>Mercado Pago Key:</strong> </label>
          <input
            type="text"
            value={mercadoPagoKey}
            onChange={(e) => setMercadoPagoKey(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
        <img
  src='assets/imagem/correios.png'
  width={'150px'}
  height={'100px'}
  style={{ display: 'block', margin: '0 auto' }}
  className='img-fluid'
/>      
          <label style={{ display: 'block', marginBottom: '5px',  color:'white' }}><strong>Correios Key:</strong> </label>
          <input
            type="text"
            value={correiosKey}
            onChange={(e) => setCorreiosKey(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <br></br><br></br>
      </div>
    </div>
  );
};

export default KeysPage;
