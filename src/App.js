import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';  
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import PrivacyPolicy from './components/PrivacyPolicy';
import Dashboard from './pages/DashBoard'; // Importe o Dashboard
import Register from './components/Register';
import "./Navbar.css"; // Importa o arquivo CSS
import ErrorBoundary from './components/ErrorBoundary'; // Importando o Error Boundary
import { useAuth, AuthProvider } from './components/AuthContext';// Estilos de fundo e rodapé
import axios from 'axios';
import NavigationBar from './components/NavigationBar';
import DashBoardLogin from './components/DashBoardLogin';
import SliderPage from './pages/SliderPage';
import ListPage from './pages/ListPage';
import KeysPage from './pages/KeysPage';
import { jwtDecode } from 'jwt-decode';
import Compras from './pages/Compras';


const backgroundStyle = {
  background: `url(/assets/imagem/background.gif) repeat, 
               url(/assets/imagem/background.jpg) no-repeat center center fixed`,
  backgroundSize: 'auto, cover',
  minHeight: '100vh', // Garante que a altura mínima do container seja 100% da altura da janela
  flexDirection: 'column',
};

const footerStyle = {
  backgroundColor: '#007FFF',
  height: '20px',
  color: 'white',
  textAlign: 'center',
  lineHeight: '20px',
  position: 'fixed',  // Fixa o rodapé na parte inferior da tela
  bottom: 0,          // Garante que o rodapé fique no fundo
  left: 0,
  color:'white',
  width: '100%',      // Faz o rodapé ocupar toda a largura da tela
  zIndex: 1000,     // Garante que o rodapé vai para o final
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
  const navigate = useNavigate();
  // Defina corretamente o estado e o setUserName
  // Função chamada quando o formulário for submetido
  const onSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault(); // Evita o envio do formulário
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
  
      // Envia a requisição de login
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedObject),
      });
  
      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer login.');
      }
  
      const data = await response.json();
      console.log('Resposta do servidor:', data);
  
      // Extrai as informações necessárias da resposta
      const { message, token, userId, userName } = data;
  
      if (message === "Login bem-sucedido" && userName && userId && token) {
        // Salva as informações no localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);
  
        // Salva no contexto de autenticação (se você estiver utilizando)
        login(userName, userId, token);
  
        // Navega para a rota principal
        navigate('/');
        window.location.reload();
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
  const [intervalTime, setIntervalTime] = useState(''); // Valor padrão de 3000 ms

  // Função para buscar o intervalo de tempo do backend
  const fetchIntervalFromBackend = async () => {
    try {
      console.log('Iniciando requisição GET para /lord');
  
      const response = await axios.get('/lord'); // Remove o endereço completo, usando proxy ou baseURL
  
      // Validação e tratamento de dados
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.warn('Resposta do backend vazia ou em formato incorreto:', response.data);
        return; // Sai da função se a resposta for inválida
      }
  
      // Como o backend retorna um array, pegamos o primeiro elemento
      const firstResult = response.data[0];
  
      if (!firstResult.interval_time) {
        console.warn('Campo interval_time ausente na resposta:', firstResult);
        return;
      }
  
      const interval = Number(firstResult.interval_time);
  
      if (isNaN(interval) || interval <= 0) {
        console.warn('Intervalo recebido é inválido:', interval);
        return;
      }
  
      setIntervalTime(interval);
      console.log('Intervalo definido para:', interval); // Adiciona um log de sucesso
  
    } catch (error) {
      console.error('Erro ao buscar intervalo:', error.response?.data || error.message);
      // Tratar erros específicos, se necessário (ex: status code 404, 500)
      if (error.response?.status === 404) {
          console.error('Rota /lord não encontrada no backend.');
      } else if (error.response?.status === 500) {
          console.error('Erro interno do servidor ao buscar o intervalo.');
      }
  
    }
  };

  // Função para passar para a próxima imagem
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Usar o efeito para buscar o intervalo quando o componente for montado
  useEffect(() => {
    fetchIntervalFromBackend(); // Busca o intervalo quando o componente é montado
  }, []);

  // Usar o intervalo para a troca das imagens
  useEffect(() => {
    const interval = setInterval(nextImage, intervalTime); // Usa o intervalo retornado do backend

    return () => clearInterval(interval); // Limpa o intervalo quando o componente for desmontado ou o intervalo mudar
  }, [intervalTime]); // Dependência de intervalTime

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

  // Função para atualizar o tempo do carrossel (passando para SliderPage)

 

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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [products, setProducts] = useState([]); // Inicializa com um array vazio // Definição da variável de estado
  const handleShow = () => setShowModal(true); // Função para mostrar o modal
  const handleClose = () => setShowModal(false); 
  const handleLogout = () => {
    logout(); // Chama a função logout para limpar o localStorage e o estado
    window.location.reload(); 
  };
  useEffect(() => {
    // Exemplo de como usar o authState para carregar dados protegidos
    if (authState.isLoggedIn) {
        // Busque dados protegidos aqui, usando o token do authState, se necessário
        console.log("Usuário logado, buscando dados...");
    } else {
        console.log("Usuário não logado.");
    }
}, [authState.isLoggedIn]); 
  const handleRegister = () => {
    setShowLoginModal(false);  // Fechando o modal de login
    navigate('/register');      // Redirecionando para a página de registro
  };
  const fetchCartItems = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return; // Se não tiver userId, não faz a requisição
    
    try {
      const response = await axios.get(`http://localhost:5000/cart/${userId}`);
      setCartItems(response.data); // Atualiza os itens no estado
    } catch (error) {
      console.error("Erro ao buscar os itens do carrinho:", error);
    }
  };
  
  // Exibindo o número de itens no carrinho
  const cartItemCount = cartItems.length;
  
 

  

  useEffect(() => {
    fetchCartItems();
 const timer = setTimeout(() => setIsPageLoading(false), 2000); // 2 segundos de loader
    return () => clearTimeout(timer);
  }, []);
  const loginUser = () => {
    const correctUsername = 'jesus'; // Usuário hardcoded
    const correctPassword = 'jesus'; // Senha hardcoded

    if (username === correctUsername && password === correctPassword) {
      setIsAuthenticated2(true); // Se as credenciais estiverem corretas, autentica o usuário
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
  
  
  // Função para adicionar produto ao carrinho
  const addToCart = async (product) => {
    const userId = localStorage.getItem('userId'); // Obtém o userId do localStorage
  
    if (!userId) {
      setShowLoginModal(true); // Solicita login se o usuário não estiver logado
      return; // Não prossegue se o usuário não estiver logado
    }
  
    try {
      const response = await axios.post("http://localhost:5000/cart", {
        usuario_id: userId,  // Passa o userId recuperado do localStorage
        produto_id: product.id,
        quantidade: 1, // Adiciona uma unidade por padrão
      });
  
      if (response.status === 201 || response.status === 200) {
        fetchCartItems(); // Recarrega os itens do carrinho após adicionar
        setError(null); // Limpa qualquer erro anterior
  
        // Exibe o alerta "Item adicionado com sucesso" apenas se o usuário estiver logado
        if (userId) {
          alert('Item adicionado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
      setError("Erro ao adicionar produto ao carrinho.");
    }
  };
  
  
  
  

  const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/produtos`, {
            withCredentials: true,
          });
          if (response.data && response.data.length > 0) {
            const firstFiveProducts = response.data.slice(0, 5);
            setProducts(firstFiveProducts);
          } else {
            setError('Nenhum produto encontrado');
          }
        } catch (error) {
          console.error('Erro na requisição:', error);
          setError('Erro ao carregar produtos');
        } finally {
          setLoading(false);
        }
      };
  
      fetchProducts();
    }, []);
  
    if (loading) {
      return <div>Carregando...</div>;
    }
  
    if (error) {
      return <div>{error}</div>;
    }
  
    return (
      <div className="container mt-5">
        <h1
          style={{
            color: '#007FFF',
            fontWeight: 'bold',
          }}
          className="mt-4"
        >
          Produtos em Destaque
        </h1>
        <div className="row">
          {products.map((product) => (
            <div className="col-md-3 mb-4" key={product.id}>
              <div className="card h-100">
                <img
                  src={product.imagem_path}
                  width={'300px'}
                  height={'250px'}
                  className="card-img-top img-fluid"
                  alt={product.nome}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.nome}</h5>
                  <p className="card-text eagle">R${Number(product.preco).toFixed(2)}</p>
                  <button className="btn btn-primary img-fluid" onClick={() => addToCart(product)}>
                    Comprar Agora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  



  const CartPage = () => {
    const [userCEP, setUserCEP] = useState('');
    const [frete, setFrete] = useState(0);
    const [totalComFrete, setTotalComFrete] = useState(0);
    const [tipoFrete, setTipoFrete] = useState('04014'); // '04014' é o código para o Sedex
    const [loadingFrete, setLoadingFrete] = useState(false);
    const [cartItems, setCartItems] = useState([]); // Lista de itens do carrinho
    const [products, setProducts] = useState([]);
    const handleConfirmarCompra = () => {
      // Lógica adicional (se necessário)
      navigate('/compras'); // Redireciona para o componente Compras
    };
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get("http://localhost:5000/produtos");
          setProducts(response.data);
        } catch (error) {
          console.error("Erro ao carregar produtos", error);
        }
      };
      fetchProducts();
    }, []);
  
    // Função para obter o userId a partir do token
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
  
    // Função para buscar o CEP do usuário
    const fetchUserCEP = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error('Erro: userId não encontrado.');
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/users/${userId}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar CEP do usuário.');
        }
        const { cep } = await response.json();
        setUserCEP(cep);
        return cep;
      } catch (error) {
        console.error('Erro ao buscar CEP:', error.message);
      }
    };
  
    // Função para calcular o frete
    const fetchFrete = async (cep, tipo) => {
      if (!cep) {
        console.error("CEP não fornecido.");
        return;
      }
    
      try {
        setLoadingFrete(true);
        console.log("Calculando frete para o CEP:", cep, "com tipo:", tipo);
    
        // Formata o CEP para garantir validade
        const formatCep = (cep) => cep.replace(/\D/g, "");
        const formattedCep = formatCep(cep);
    
        // Validações básicas
        if (formattedCep.length !== 8) {
          throw new Error("CEP inválido.");
        }
    
        // Requisição para a API de frete
        const response = await fetch(`http://localhost:5000/frete/${formattedCep}?tipo=${tipo}`);
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }
    
        const responseData = await response.json();
        console.log("Resposta da API:", responseData);
    
        // Extrai o valor do frete
        const valorFrete = responseData.valor ? parseFloat(responseData.valor) : 0;
        console.log("Frete calculado:", valorFrete);
    
        // Atualiza os estados
        setFrete(valorFrete);
        setTotalComFrete(calculateTotal() + valorFrete);
      } catch (error) {
        console.error("Erro ao calcular frete:", error.message);
      } finally {
        setLoadingFrete(false);
      }
    };
    
    
    // Função para calcular o total dos itens no carrinho
   // Função para calcular o total dos itens no carrinho
const calculateTotal = () => {
  return cartItems.reduce((acc, item) => {
    const preco = Number(item.product_price); // Converte para número
    const quantidade = item.quantidade;
    if (!isNaN(preco) && !isNaN(quantidade) && preco > 0 && quantidade > 0) {
      return acc + preco * quantidade;
    }
    return acc;
  }, 0);
};

// Verifica se o frete foi calculado e aplica o valor correto
const freteValue = isNaN(frete) || frete <= 0 ? 0 : frete; // Verifica se o frete é válido

// Calcula o total com frete
const total = calculateTotal();
const totalComFreteFormatted = (total + freteValue).toFixed(2);

// Exibe o total com o frete
console.log(`Total do Carrinho (com frete): R$${totalComFreteFormatted}`);

  
  
    // Função para atualizar a quantidade de um item no carrinho
    const updateQuantity = async (id, newQuantity) => {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantidade: newQuantity } : item
        )
      );
      try {
        await axios.put(`http://localhost:5000/cart/${id}`, {
          quantidade: newQuantity,
        });
        fetchCartItems(); // Atualiza os itens após modificar
      } catch (error) {
        console.error('Erro ao atualizar a quantidade:', error.message);
      }
    };
  
    // Função para remover um item do carrinho
    const removeFromCart = async (id) => {
      try {
        const response = await fetch(`http://localhost:5000/cart/${id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          throw new Error(`Erro: ${response.statusText}`);
        }
  
        const data = await response.json();
  
        if (response.ok) {
          setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
          console.log('Item removido:', data.message);
        } else {
          console.error('Erro ao remover item:', data.message);
        }
      } catch (error) {
        console.error('Erro ao remover item do carrinho:', error.message);
      }
    };
  
    // Função para atualizar o tipo de frete selecionado
    const handleFreteChange = (event) => {
      const selectedFrete = event.target.value;
      setTipoFrete(selectedFrete);
      if (userCEP) {
        fetchFrete(userCEP, selectedFrete);
      }
    };
  
    // Função para buscar os itens do carrinho
    const fetchCartItems = async () => {
      try {
        const userId = getUserIdFromToken();
        if (!userId) return;
        const response = await fetch(`http://localhost:5000/cart/${userId}`);
        const items = await response.json();
        setCartItems(items);
      } catch (error) {
        console.error('Erro ao buscar os itens do carrinho:', error.message);
      }
    };
  
    // Efeito para carregar dados iniciais
    useEffect(() => {
      fetchUserCEP().then((cep) => {
        if (cep) {
          fetchFrete(cep, tipoFrete);
        }
      });
      fetchCartItems(); // Carregar itens do carrinho ao montar o componente
    }, []);
  
    return (
      <div className="container mt-3">
        <h1 className="text-center" style={{ color: '#007FFF', fontWeight: 'bold' }}>Carrinho de Compras</h1>
        <div className="row justify-content-center">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div className="col-12 col-sm-6 col-md-4 mb-4" key={item.id}>
                <div className="text-center">
                  <img
                    src={item.imagem_path}
                    className="img-fluid"
                    alt={item.product_name}
                      style={{ width: '100px', height: '100px' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: '#007FFF', fontWeight: 'bold' }}>
                      {item.product_name}
                    </h5>
                    <p style={{ color: '#007FFF', fontWeight: 'bold' }} >Preço: R${Number(item.product_price).toFixed(2)}</p>
                    <div className="d-flex justify-content-center align-items-center mb-2">
                      <button
                        className="btn btn-outline-secondary mx-2"
                        onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantidade}</span>
                      <button
                        className="btn btn-outline-secondary mx-2"
                        onClick={() => updateQuantity(item.id, item.quantidade + 1)}
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
            ))
          ) : (
            <p className="text-center" style={{ color: '#007FFF', fontWeight: 'bold' }}>
              Seu carrinho está vazio.
            </p>
          )}
        </div>
    
        <h3 className="text-center" style={{ color: '#007FFF', fontWeight: 'bold' }}>
          Total: R${totalComFreteFormatted}
        </h3>
    
        {userCEP && (
          <div className="text-center">
            <p style={{ color: '#007FFF', fontWeight: 'bold' }}>CEP do usuário: {userCEP}</p>
            {loadingFrete && (
              <p style={{ color: '#FF9900', fontWeight: 'bold' }}>Calculando o valor do frete . . .</p>
            )}
          </div>
        )}
    
        {frete > 0 && (
          <p className="text-center" style={{ color: '#007FFF', fontWeight: 'bold' }}>
            Frete: R${frete.toFixed(2)}
          </p>
        )}
    
        <div className="text-center">
          <div className="form-check d-inline-block mx-2">
            <input
              className="form-check-input"
              type="radio"
              name="frete"
              value="04014"
              id="sedex"
              checked={tipoFrete === '04014'}
              onChange={handleFreteChange}
            />
            <label className="form-check-label" htmlFor="sedex">
              Sedex
            </label>
          </div>
          <div className="form-check d-inline-block mx-2">
            <input
              className="form-check-input"
              type="radio"
              name="frete"
              value="04510"
              id="pac"
              checked={tipoFrete === '04510'}
              onChange={handleFreteChange}
            />
            <label className="form-check-label" htmlFor="pac">
              PAC
            </label>
          </div>
        </div>
    
        <div className="text-center mt-4">
          <button style={{marginBottom:'30px'}}         onClick={handleConfirmarCompra} className="btn btn-primary btn-lg">Revisar compra</button>
        </div>
      </div>
    );
    
  };



  
  

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
         <Carousel/> {/* Passa o tempo para o carrossel */}
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
  const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get('http://localhost:5000/produtos', {
            withCredentials: true,
          });
          setProducts(response.data);
        } catch (err) {
          console.error('Erro ao buscar produtos:', err);
          setError('Erro ao carregar os produtos. Tente novamente mais tarde.');
        }
  
        // Simula um tempo de carregamento fixo (2 segundos)
      }
  
      fetchProducts();
    }, []);
  
  
    if (error) {
      return <div className="text-center mt-5 text-danger">{error}</div>;
    }
    <div>
    <h1 className="text-center">Controle o Tempo do Carrossel</h1>
    <ListPage/>
    <SliderPage />
    <KeysPage /> {/* Passa a função para editar o tempo */}
    <Carousel/> {/* Passa o tempo para o carrossel */}
    </div>
    return (
      <div className="container mt-5">
        <h1
          style={{
            color: '#007bff',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
          className="mb-4"
        >
          Nossos Produtos
        </h1>
        <div className="row">
          {products.map((product) => (
            <div className="col-md-4 mb-4" key={product.id}>
              <div className="card h-100">
                <img
                  src={product.imagem_path}
                  width={'300px'}
                  height={'250px'}
                  className="card-img-top img-fluid"
                  alt={product.nome}
                />
                <div style={{textAlign:'center'}} className="card-body">
                  <h5 className="card-title " style={{textAlign:'center'}}>{product.nome}</h5>
                  <p className="card-text eagle" style={{textAlign:'center'}}>R${Number(product.preco).toFixed(2)}</p>
                  <button className="btn btn-primary img-fluid" onClick={() => addToCart(product)}>
                    Comprar Agora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
  
  <ul>
  {filteredProducts.map((product) => (
    <li key={produtos.id}>
      <img src={produtos.image_path} alt={prodrodutos.name} />
      <h3>{produtos.nome}</h3>
      <p>R${produtos.preco.toFixed(2)}</p>
    </li>
  ))}
</ul>
  
  const handleDashboardClick = () => {
    if (!isAuthenticated) {
      alert('Você precisa fazer login para acessar o dashboard.');
      handleShow(); // Abre o modal de login
    }
  };
  useEffect(() => {
    // Exibe o loader ao carregar o app
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'flex';

    // Simula carregamento e esconde o loader após 2 segundos
    const timer = setTimeout(() => {
      if (loader) loader.style.display = 'none';
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <AuthProvider> {/* Wrap your app here */}
 <ErrorBoundary>
    <div style={backgroundStyle}>
      
      <PrivacyPolicy />
      
         {/* Renderiza a navegação somente se o usuário NÃO estiver autenticado */}
         {!isAuthenticated && (
        <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: 'transparent' }}>
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
            >
              <ul
                className="navbar-nav"
                style={{
                  marginLeft: 'auto',
                  textAlign: 'right',
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
                <li className="nav-item ms-auto">
                  <button
                    className="btn btn-link nav-link"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Login/Cadastro
                  </button>
                </li>
                <li className="nav-item">
                <Link to="/cart" className="nav-link">
              Carrinho ({cartItemCount})
            </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
     
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
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<NavigationBar />} />
          <Route path="/cart" element={<CartPage />} /> 
          <Route path="/" element={<DashBoardLogin />} /> 

          <Route 
        path="/slied" 
        element={isAuthenticated ? <SliderPage isAuthenticated /> : <Navigate to="/dashboard" />} 
      />          {/* Rota do Login */}
        <Route 
        path="/compras" 
        element={isLoggedIn ? <Compras isLoggedIn /> : <Navigate to="/comprar" />} 
      />          {/* Rota do Login */}

      <Route 
        path="/lista" 
        element={isAuthenticated ? <ListPage isAuthenticated /> : <Navigate to="/dashboard" />} 
      />          {/* Rota do Login */}
          <Route 
        path="/key" 
        element={isAuthenticated ? <KeysPage isAuthenticated /> : <Navigate to="/dashboard" />} 
      />          {/* Rota do Login */}
        </Routes>
        <LoginModal
          show={showLoginModal}
          handleClose={() => setShowLoginModal(false)}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
        />
      </div>
      <footer  style={footerStyle}>
        <p>&copy; Icaro Desenvolvedor Web</p>
      </footer>
    </div>
 </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;

