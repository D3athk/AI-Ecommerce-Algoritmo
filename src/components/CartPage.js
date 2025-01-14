import React, { useState, useEffect } from 'react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]); // Estado para armazenar os itens no carrinho
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar os itens do carrinho
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/cart');
        if (!response.ok) {
          throw new Error('Erro ao carregar itens do carrinho');
        }
        const data = await response.json();
        setCartItems(data); // Atualiza os itens no carrinho
      } catch (error) {
        setError(error.message); // Se ocorrer erro
      } finally {
        setLoading(false); // Carregamento concluído
      }
    };

    fetchCartItems();
  }, []);

  // Função para atualizar a quantidade de um item no carrinho
  const updateCartItemQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return; // Evita quantidade negativa
    const updatedCartItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantidade: newQuantity } : item
    );
    setCartItems(updatedCartItems); // Atualiza o estado
  };

  // Função para remover um item do carrinho
  const removeFromCart = (id) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems); // Remove o item do carrinho
  };

  // Função para adicionar um item no carrinho
  const addItemToCart = (item) => {
    // Verifica se o item já existe no carrinho
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      // Se já estiver no carrinho, aumenta a quantidade
      updateCartItemQuantity(existingItem.id, existingItem.quantidade + 1);
    } else {
      // Caso contrário, adiciona o novo item
      setCartItems([...cartItems, { ...item, quantidade: 1 }]);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <h1>Minha Sacola</h1>
        <p>Carregando itens do carrinho...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h1>Minha Sacola</h1>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Minha Sacola</h1>

      {cartItems.length > 0 ? (
        <div>
          <ul className="list-group mb-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    style={{ width: '50px', height: '50px', marginRight: '10px' }}
                  />
                  <div>
                    <strong>{item.nome}</strong> -
                    <input
                      type="number"
                      value={item.quantidade || 1}
                      onChange={(e) =>
                        updateCartItemQuantity(item.id, parseInt(e.target.value))
                      }
                      min="1"
                      style={{ width: '60px', marginLeft: '10px' }}
                    />
                    x R$ {parseFloat(item.preco).toFixed(2)}
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
          <h3>
            Total: R$
            {cartItems
              .reduce((acc, item) => acc + item.preco * item.quantidade, 0)
              .toFixed(2)}
          </h3>
        </div>
      ) : (
        <p>Seu carrinho está vazio.</p>
      )}
    </div>
  );
};

export default CartPage;
