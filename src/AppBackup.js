import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';  
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import PrivacyPolicy from './components/PrivacyPolicy';
import CartPage from './components/CartPage';
import Dashboard from './pages/DashBoard'; // Importe o Dashboard
import Register from './components/Register';
import "./Navbar.css"; // Importa o arquivo CSS
import ErrorBoundary from './components/ErrorBoundary'; // Importando o Error Boundary
import { useAuth, AuthProvider } from './components/AuthContext';// Estilos de fundo e rodapé
import axios from 'axios';
import NavigationBar from './components/NavigationBar';
import DashBoardLogin from './components/DashBoardLogin';
const backgroundStyle = {
  background: `url(/assets/imagem/background.gif) repeat, 
               url(/assets/imagem/background.jpg) no-repeat center center fixed`,
  backgroundSize: 'auto, cover',
  minHeight: '100vh', // Garante que a altura mínima do container seja 100% da altura da janela
  display: 'flex',
  flexDirection: 'column',
};

const footerStyle = {
  backgroundColor: '#007FFF',
  height: '20px',
  color: 'white',
  textAlign: 'center',
  lineHeight: '20px',
  position: 'relative',  // Usar position relative para posicionar o rodapé ao final
  bottom: '-5px',             // Garante que o rodapé fique no final
  width: '100%',
  marginTop: 'auto',     // Garante que o rodapé vai para o final
};

const contentStyle = {
  flex: 1,                // Expande o conteúdo para ocupar o restante da tela
  display: 'flex',
  flexDirection: 'column', // Garante que o conteúdo e o rodapé sejam empilhados verticalmente
  minHeight: '100vh',      // Garante que a altura mínima da tela ocupe 100% da altura da tela
};
// Modal de Login

const LoginModal = ({ show, handleClose, handleLogin, handleRegister, isLoggedIn}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [userName, setUserName] = useState(''); 
  const { login } = useAuth();
  // Defina corretamente o estado e o setUserName
  // Função chamada quando o formulário for submetido
 const onSubmit = async (e) => {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  try {
    if (!email || !senha) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const sanitizedObject = {
      email: email.trim(),
      senha: senha.trim(),
    };

    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedObject),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer login.');
    }

    const data = await response.json();
    console.log('Resposta do servidor:', data);

    // Use os campos corretos retornados pelo backend
    const { userName, userId } = data;

    if (userName && userId) {
      login(userName, userId); // Salva no contexto de autenticação
      alert(`Bem-vindo, ${userName}! Login bem-sucedido!`);
      
    } else {
      throw new Error('Resposta inválida do servidor.');
    }
  } catch (error) {
    console.error('Erro ao tentar fazer login:', error);
    alert(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
  }
};
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Digite seu email"
              value={email} // Controla o valor do campo
              onChange={(e) => setEmail(e.target.value)} // Atualiza o valor de email no estado
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              placeholder="Digite sua senha"
              value={senha} // Controla o valor do campo
              onChange={(e) => setSenha(e.target.value)} // Atualiza o valor de senha no estado
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Login
          </Button>
        </Form>
        <div className="mt-3">
          <Button variant="link" onClick={handleRegister}>
            Não tem conta? Cadastre-se
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const Carousel = () => {
  const images = [
    '/assets/imagem/slide1.jpg',
    '/assets/imagem/slide2.jpg',
    '/assets/imagem/slide3.jpg',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mt-4 position-relative">
   
      <img
        src={images[currentImageIndex]}
        alt={`Slide ${currentImageIndex + 1}`}
        className="img-fluid"
        style={{ maxHeight: '207px', margin: '0 auto' }}
      />

    </div>
  );
};

const App = () => {
  
	  const navigate = useNavigate(); // Mova para cá
    const [email, setEmail] = useState(''); // Estado para armazenar o email
  const [senha, setSenha] = useState(''); // Estado para armazenar a senha
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userName, setUserName, isLoggedIn, setIsLoggedIn, logout, login, authState } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showModal, setShowModal] = useState(false); // Inicializando o estado de showModal
	const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleShow = () => setShowModal(true); // Função para mostrar o modal
  const handleClose = () => setShowModal(false); 
  const handleLogout = () => {
    logout(); // Chama a função logout para limpar o localStorage e o estado
    window.location.reload(); 
  };

  const handleRegister = () => {
    setShowLoginModal(false);  // Fechando o modal de login
    navigate('/register');      // Redirecionando para a página de registro
  };
  const [isPageLoading, setIsPageLoading] = useState(true); // Estado para controle do carregamento
  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/cart');
      if (!response.ok) {
        throw new Error('Erro ao carregar itens do carrinho');
      }
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
 const timer = setTimeout(() => setIsPageLoading(false), 2000); // 2 segundos de loader
    return () => clearTimeout(timer);
  }, []);
  const loginUser = () => {
    const correctUsername = 'jesus'; // Usuário hardcoded
    const correctPassword = 'jesus'; // Senha hardcoded

    if (username === correctUsername && password === correctPassword) {
      setIsAuthenticated(true); // Se as credenciais estiverem corretas, autentica o usuário
      setShowModal(false); // Fecha o modal
      setError(''); // Limpa o erro
    } else {
      setError('Usuário ou senha incorretos.'); // Se estiver incorreto, exibe erro
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do formulário
  
    // Sanitiza os dados de entrada
    const sanitizedObject = {
      email: email.toString(),
      senha: senha.toString(),
    };
  
    try {
      // Faz a requisição para o backend
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedObject),
      });
  
      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error('Erro ao fazer login');
      }
  
      // Parseia a resposta do servidor
      const data = await response.json();
  
      // Log para depuração
      console.log('Login bem-sucedido:', data);
  
      // Verifica se os dados de usuário foram recebidos corretamente
      if (data?.nome && data?.userId) {
        // Armazena os dados no contexto de autenticação
        login(data.nome, data.userId);
  
        // Exibe um alerta de boas-vindas
        alert(`Bem-vindo, ${data.nome}! Login bem-sucedido!`);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      // Log de erro para depuração
      console.error('Erro ao fazer login:', error);
  
      // Exibe um alerta genérico de erro
      alert('Erro ao fazer login. Verifique suas credenciais.');
    }
  };
  // Função para validar as credenciais antes de enviar


  // Função de submit do formulário
  const handleSubmit = (event) => {
    event.preventDefault(); // Evita o recarregamento da página

    // Valida as credenciais
    const validationError = validateCredentials();
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setEmailError(''); // Limpa a mensagem de erro
    handleLogin(email, senha); // Chama a função de login
  };

  
  // Função para buscar as informações do usuário
  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      return response.data; // Retorna as informações do usuário
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      throw error; // Lança o erro para ser tratado na função handleLogin
    }
  };
  
  // Função para validar o e-mail e senha
  const validateCredentials = (email, senha) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      alert('E-mail inválido.');
      return false;
    }
  
    if (!senha || senha.trim().length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
  
    return true;
  };
  
  
  const addToCart = (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true); // Solicita login apenas se o usuário tentar adicionar um produto
    } else {
      const newCartItems = [...cartItems];
      const productIndex = newCartItems.findIndex(item => item.id === product.id);
      if (productIndex >= 0) {
        newCartItems[productIndex].quantity += 1; // Aumenta a quantidade se o produto já estiver no carrinho
      } else {
        newCartItems.push({ ...product, quantity: 1 }); // Adiciona o produto ao carrinho
      }
      setCartItems(newCartItems);
    }
  };

  const removeFromCart = (productId) => {
    const newCartItems = cartItems.filter(item => item.id !== productId);
    setCartItems(newCartItems);
  };

  const updateQuantity = (productId, quantity) => {
    const newCartItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: quantity } : item
    );
    setCartItems(newCartItems);
  };
 

  
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const FeaturedProducts = ({ products }) => (
    <div className="container mt-5">
      <h1
        style={{
          color: '#007FFF',
          WebkitTextStroke: '1px black',
          fontWeight: 'bold',
        }}
        className="mt-4"
      >
        Produtos em destaque
      </h1>
      <div className="row">
        {products.slice(0, 10).map((product) => (
          <div className="col-md-3 mb-4" key={product.id}>
            <div className="card h-100">
              <img src={product.image} className="card-img-top" alt={product.name} />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">R${product.price.toFixed(2)}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => addToCart(product)}
                >
                  Comprar Agora
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CartPage = () => (
    <div className="container mt-5">
      <h1>Carrinho de Compras</h1>
      <div className="row">
        {cartItems.map((item) => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div className="card">
              <img src={item.image} className="card-img-top" alt={item.name} />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">R${item.price.toFixed(2)}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h3>Total: R${calculateTotal().toFixed(2)}</h3>
      <button className="btn btn-success">Finalizar Compra</button>
    </div>
  );

  const HomePage = ({ products }) => {
    const { isLoggedIn, userName } = useAuth(); // Adicionando useAuth aqui
    
    return (
      <div className="container mt-3 text-center">
        {/* Verifica se o usuário está logado */}
      {authState.isLoggedIn && (
        <h3
          style={{
            color: '#007FFF',
            fontWeight: 'bold',
          }}
        >
          Olá, seja Bem-vindo, {authState.userName}! <br />
          Boas Compras!!!! 
          
          <Link
            
            to="/"
            style={{
              color: 'red',
              fontWeight: 'bold',
               marginRight: '0px',
            }}
            onClick={logout}  // Ação de logout ao clicar no link
          >
            &nbsp;Sair da conta
          </Link>
        </h3>
        )}
        <Carousel />
        <h1
          style={{
            color: '#007FFF',
            fontWeight: 'bold',
          }}
          className="mt-4"
        >
          Bem-vindo à nossa loja de e-commerce
        </h1>
        <p
          style={{
            color: '#007FFF',
            fontWeight: 'bold',

          }}
        >
          Explore nossa coleção de produtos incríveis!
        </p>
        <Link to="/products" className="btn btn-primary mt-3 d-block mx-auto" style={{ width: '150px' }}>
          Ver Produtos
        </Link>
        <FeaturedProducts products={products} />
      </div>
    );
  };
  const ProductsPage = ({ products }) => (
    <div className="container mt-5">
      <h1>Nossos Produtos</h1>
      <div className="row">
        {products.map((product) => (
          <div className="col-md-4 mb-4" key={product.id}>
            <div className="card">
              <img src={product.image} className="card-img-top" alt={product.name} />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">R${product.price.toFixed(2)}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => addToCart(product)}
                >
                  Comprar Agora
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
 if (isPageLoading) {
    return (
      <div className="text-center img-fluid mt-5">
        <img src="/assets/imagem/loader.gif" alt="Carregando..." />
      </div>
    );
  }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}


  const NotFoundPage = () => (
    <div className="container mt-5 text-center">
      <h1>404 - Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <Link to="/" className="btn btn-secondary">
        Voltar para a Home
      </Link>
    </div>
  );

  const products = [
    { id: 1, name: 'Produto 1', price: 29.99, image: '/assets/imagem/1.png' },
    { id: 2, name: 'Produto 2', price: 49.99, image: '/assets/imagem/2.png' },
    { id: 3, name: 'Produto 3', price: 19.99, image: '/assets/imagem/3.png' },
    { id: 4, name: 'Produto 4', price: 39.99, image: '/assets/imagem/4.png' },
    { id: 5, name: 'Produto 5', price: 59.99, image: '/assets/imagem/5.png' },
    { id: 6, name: 'Produto 6', price: 89.99, image: '/assets/imagem/6.png' },
    { id: 7, name: 'Produto 7', price: 25.99, image: '/assets/imagem/7.png' },
    { id: 8, name: 'Produto 8', price: 99.99, image: '/assets/imagem/8.png' },
    { id: 9, name: 'Produto 9', price: 89.99, image: '/assets/imagem/9.png' },
    { id: 10, name: 'Produto 10', price: 15.99, image: '/assets/imagem/10.png' },
  ];
  const handleDashboardClick = () => {
    if (!isAuthenticated) {
      alert('Você precisa fazer login para acessar o dashboard.');
      handleShow(); // Abre o modal de login
    }
  };
  return (
    <AuthProvider> {/* Wrap your app here */}
 <ErrorBoundary>
    <div style={backgroundStyle}>
      
      <PrivacyPolicy />
      
      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{ backgroundColor: '#007FFF' }}
      >
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            <img
              src="/assets/imagem/logo.png"
              alt="Logo"
              height="55"
              className="d-inline-block align-text-top"
            />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse"
            id="navbarNav"
            style={{
              backgroundColor: isMobile ? 'transparent' : '#007FFF', // Transparente no mobile
              transition: 'background-color 0.3s ease', // Animação suave
            }}
          >
            <ul
              className="navbar-nav"
              style={{
                marginLeft: 'auto', // Empurra o menu para a direita
                textAlign: 'right', // Alinha o conteúdo do menu à direita
              }}
            >
              <li className="nav-item">
                <Link to="/" className="nav-link active">
                  Home
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/dashboard" onClick={handleDashboardClick} className="nav-link active">
                  DashBoard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link">
                  Produtos
                </Link>
              </li>
              <li className="nav-item- ms-auto">
                <button
                  className="btn btn-link nav-link"
                  onClick={() => setShowLoginModal(true)}
                >
                   Login/Cadastro
                </button>
              </li>
              <li className="nav-item">
                <Link to="/cart" className="nav-link">
                  Carrinho ({cartItems.length})
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div style={contentStyle}>
        <Routes>
          
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center vh-100">
<h1 style={{ color: '#007FFF', marginTop:'-140px',  fontWeight: 'bold' }}>Você precisa estar logado</h1>
              <img className="img-fluid mb-3" width={'300'} height={'300'} src="assets/imagem/erro.png" alt="Erro" />
              
          
           
                {/* Exibe o modal se o usuário não estiver autenticado */}
                <DashBoardLogin
                  show={showModal}
                  handleClose={handleClose}
                  setIsAuthenticated={setIsAuthenticated}
                  setUserName={setUserName}
                />
              </div>
            )
          }
        /> {/* A rota para o Dashboard */}
          <Route path="/" element={<HomePage products={products} />} />
          <Route path="/products" element={<ProductsPage products={products} />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<NavigationBar />} />
        </Routes>
        <LoginModal
          show={showLoginModal}
          handleClose={() => setShowLoginModal(false)}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
        />
      </div>
      <footer className="d-flex flex-column" style={footerStyle}>
        <p>&copy; 2024 Todos os direitos reservados</p>
      </footer>
    </div>
 </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;

