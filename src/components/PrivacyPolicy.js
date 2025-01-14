import React, { useState, useEffect } from 'react';

const PrivacyPolicy = () => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const acceptedPolicy = localStorage.getItem('privacyPolicyAccepted');
    if (acceptedPolicy === 'true') {
      setAccepted(true); // Se já aceitou, não precisa exibir o modal
    }
  }, []);

  const handleAccept = () => {
    setAccepted(true);
    localStorage.setItem('privacyPolicyAccepted', 'true'); // Salvar no localStorage
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com"; // Redireciona para o Google se não aceitar
  };

  if (accepted) {
    return null; // Se aceitou, não renderiza o modal
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fundo escuro (ajustado)
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          position: 'relative', // Para permitir o posicionamento do "X"
        }}
      >
       <button
          onClick={handleDecline}
          style={{
	color: 'red',
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '30px',
            cursor: 'pointer',
            zIndex: 10000, // Garante que o "X" fique no topo
          }}
        >
           <img src="assets/imagem/close.png"/>
        </button>

        <h2>Política de Privacidade e Devolução</h2>
        <a href="#" style={{ textDecoration: 'none', color: '#007bff' }}>Leia nossa Política de Privacidade e Devolução</a>
        
        <div>
          <label>
            <input type="checkbox" /> Aceito os termos e condições
          </label>
        </div>
        
        <div className="mt-3">
          <button
            style={{
              backgroundColor: '#007bff', // Cor azul para Aceitar
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
            onClick={handleAccept}
          >
            Aceitar
          </button>

          <button
            style={{
              backgroundColor: '#dc3545', // Cor vermelha para Recusar
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginLeft: '10px',
            }}
            onClick={handleDecline}
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
