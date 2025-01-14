import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBarcode, FaCreditCard, FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Compras = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [userId, setUserId] = useState(null);
  const [frete, setFrete] = useState(0);
  const [totalComFrete, setTotalComFrete] = useState(0);

  // Obtém o userId a partir do token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Usuário não autenticado ou token não encontrado.');
      return null;
    }
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.id;
    } catch (error) {
      console.error('Erro ao decodificar o token:', error.message);
      return null;
    }
  };

  // Busca os itens do carrinho
  const fetchCartItems = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return; // Se não houver userId, não faz a requisição

    try {
      const response = await axios.get(`http://localhost:5000/cart/${userId}`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Erro ao carregar itens do carrinho:', error);
    }
  };

  // Calcula o total do carrinho
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const preco = Number(item.product_price) || 0;
      const quantidade = item.quantidade || 0;
      return acc + preco * quantidade;
    }, 0);
  };

  // Busca e calcula o frete baseado no CEP
  const fetchFrete = async (cep) => {
    if (!cep) {
      console.error('CEP não fornecido.');
      return;
    }

    try {
      // Formata o CEP
      const formattedCep = cep.replace(/\D/g, '');

      if (formattedCep.length !== 8) {
        throw new Error('CEP inválido.');
      }

      // Faz a requisição para a API de frete
      const response = await fetch(`http://localhost:5000/frete/${formattedCep}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const valorFrete = parseFloat(data.valor) || 0;
      setFrete(valorFrete);
    } catch (error) {
      console.error('Erro ao calcular o frete:', error.message);
    }
  };

  // Atualiza o total com frete
  useEffect(() => {
    const total = calculateTotal();
    setTotalComFrete(total + frete);
  }, [cartItems, frete]);

  // Busca o CEP do usuário e calcula o frete ao carregar o componente
  useEffect(() => {
    const userIdFromToken = getUserIdFromToken();
    if (userIdFromToken) {
      setUserId(userIdFromToken); // Armazena o userId no estado
      fetchCartItems(); // Carrega os itens do carrinho

      // Busca o CEP do usuário
      axios.get(`http://localhost:5000/users/${userIdFromToken}`).then((response) => {
        const userCep = response.data.cep;
        fetchFrete(userCep); // Calcula o frete
      }).catch((error) => {
        console.error('Erro ao buscar CEP do usuário:', error.message);
      });
    }
  }, []);

  // Função para confirmar o pagamento
  const handlePayment = () => {
    if (!selectedMethod) {
      alert('Por favor, selecione um método de pagamento!');
      return;
    }
    alert(`Pagamento via ${selectedMethod} foi iniciado!`);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4" style={{ color: '#007FFF' }}>Resumo da Compra</h1>
      <h3 className="text-center mb-4" style={{ color: '#007FFF' }}>
        Total com o frete: R$ {totalComFrete.toFixed(2)}
      </h3>

      {/* Resumo dos Itens */}
      <div className="row justify-content-center">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div className="col-12 col-md-4 mb-3 text-center" key={item.id}>
              <img
                src={item.imagem_path}
                alt={item.product_name}
                className="img-fluid mb-2"
                style={{ maxHeight: '150px' }}
              />
              <h5 style={{ color: '#007FFF' }}>{item.product_name}</h5>
              <p style={{ color: '#007FFF' }}>Preço: R${Number(item.product_price).toFixed(2)}</p>
              <p style={{ color: '#007FFF' }}>Quantidade: {item.quantidade}</p>
            </div>
          ))
        ) : (
          <p className="text-center" style={{ color: '#007FFF' }}>Não há itens no carrinho.</p>
        )}
      </div>

      {/* Escolha do Método de Pagamento */}
      <h1 className="text-center mb-4" style={{ marginTop: '20px', color: '#007FFF' }}>
        Escolha o Método de Pagamento
      </h1>
            <div
        className="d-flex justify-content-center align-items-center flex-wrap"
        style={{ gap: '20px' }}
      >
        <button
          className={`btn btn-light border ${selectedMethod === 'boleto' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('boleto')}
          style={{
            borderColor: '#007FFF',
            width: '200px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FaBarcode size={50} className="mb-2" style={{ color: '#007FFF' }} />
          <h5 style={{ color: '#007FFF', margin: 0 }}>Boleto Bancário</h5>
        </button>

        <button
          className={`btn btn-light border ${selectedMethod === 'cartão' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('cartão')}
          style={{
            borderColor: '#007FFF',
            width: '200px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FaCreditCard size={50} className="mb-2" style={{ color: '#007FFF' }} />
          <h5 style={{ color: '#007FFF', margin: 0 }}>Cartão de Crédito</h5>
        </button>

        <button
          className={`btn btn-light border ${selectedMethod === 'pix' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('pix')}
          style={{
            borderColor: '#007FFF',
            width: '200px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FaQrcode size={50} className="mb-2" style={{ color: '#007FFF' }} />
          <h5 style={{ color: '#007FFF', margin: 0 }}>Pix</h5>
        </button>
      </div>

      {/* Botão de Confirmação */}
      <div className="text-center mt-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={handlePayment}
          style={{ backgroundColor: '#007FFF', marginBottom:'30px', borderColor: '#007FFF' }}
        >
          Confirmar Pagamento
        </button>
      </div>
    </div>
  );
};

export default Compras;
