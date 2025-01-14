import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import DashBoardNavigationBar from '../components/NavigationBar';
import DashBoardLogin from '../components/DashBoardLogin';
import '../dashbord.css';

const API_URL = 'http://localhost:5000';

const backgroundStyle2 = {
  background: `url(/assets/imagem/background2.gif) repeat`,
  backgroundSize: 'auto, cover',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const DashBoard = () => {
  const [auth, setAuth] = useState({ isAuthenticated: true });
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ nome: '', preco: '', quantidade: '', peso: '', imagem: null });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth && storedAuth === 'true') {
      setAuth({ isAuthenticated: true });
    } else {
      setShowModal(false);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
  
      // Adiciona um delay de 2 segundos (2000ms)
      await new Promise(resolve => setTimeout(resolve, 500));
  
      // Realiza a requisição depois do delay
      const response = await axios.get(`${API_URL}/produtos`, { withCredentials: true });
      setProducts(response.data);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para tratar erros ao buscar produtos
  const handleFetchError = (error) => {
    console.error("Erro ao buscar produtos:", error);
    setErrorMessage('Erro ao buscar produtos. Tente novamente.');
  };
  const handleImageChange = async (event) => {
    const imageFile = event.target.files[0];
    if (!imageFile) return setNewProduct({ ...newProduct, imagem: null });

    try {
      const compressedFile = await imageCompression(imageFile, { maxSizeMB: 1, maxWidthOrHeight: 800 });
      setNewProduct({ ...newProduct, imagem: compressedFile });
    } catch (error) {
      setErrorMessage('Erro ao processar a imagem.');
      setNewProduct({ ...newProduct, imagem: null });
    }
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
  
    if (!newProduct.imagem) {
      setErrorMessage('Por favor, selecione uma imagem válida.');
      return;
    }
  
    try {
      setIsLoading(true);
      setErrorMessage('');
  
      // Criando formData a partir do produto
      const formData = createFormDataFromNewProduct(newProduct);
  
      // Realizando a requisição para adicionar o produto
      const response = await axios.post(`${API_URL}/produtos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        timeout: 5000,
      });
  
      console.log("Produto adicionado com sucesso:", response);
  
      // Atualiza a lista de produtos com o novo produto
      setProducts((prev) => [...prev, response.data]);
      
      // Resetando o formulário de novo produto
      resetNewProduct();
      setShowAddModal(false);
  
      // Atualiza o estado de autenticação
      localStorage.setItem('isAuthenticated', 'true');
      setAuth({ isAuthenticated: true });
      console.log("Estado de autenticação atualizado.");
  
      // Chama a função fetchProducts para atualizar a tabela de produtos
      await fetchProducts();  // Isso irá buscar novamente a lista de produtos da API
  
    } catch (error) {
      handleAddProductError(error);
    } finally {
      setIsLoading(false);
      console.log("Processamento de adicionar produto finalizado.");
    }
  };
  
  
  // Função para tratar erros específicos ao adicionar produto
 
  
  const createFormDataFromNewProduct = (product) => {
    const { nome, preco, quantidade, peso, imagem } = product;
    const formData = new FormData();
    formData.append('nome', nome.trim());
    formData.append('preco', parseFloat(preco).toFixed(2));
    formData.append('quantidade', parseInt(quantidade, 10));
    formData.append('peso', parseFloat(peso).toFixed(2));
    formData.append('imagem', imagem);
    return formData;
  };

  const handleAddProductError = (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error("A requisição excedeu o tempo limite.");
      setErrorMessage("Tempo limite da requisição excedido. Tente novamente mais tarde.");
    } else if (error.response) {
      console.error("Erro do servidor:", error.response.status, error.response.data);
      setErrorMessage(`Erro ${error.response.status}: ${error.response.data.message || 'Erro desconhecido no servidor.'}`);
    } else {
      console.error("Erro desconhecido:", error.message);
      setErrorMessage("Erro ao adicionar o produto. Verifique sua conexão e tente novamente.");
    }
  };

  const resetNewProduct = () => {
    setNewProduct({ nome: '', preco: '', quantidade: '', peso: '', imagem: null });
    setErrorMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteProduct = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/produtos/${id}`);
      fetchProducts();
    } catch (error) {
      setErrorMessage('Erro ao excluir o produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => setShowModal(false);

  return (
    <div style={backgroundStyle2}>
      <DashBoardNavigationBar />
      <Container className="dashboard-content">
        {auth.isAuthenticated ? (
          <>
            <h1 className="mt-3 text-center">Bem-vindo à sua área administrativa</h1>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>Adicionar Produto</Button>
            {isLoading ? <Spinner animation="border" className="mt-3" /> : <ProductTable products={products} handleDeleteProduct={handleDeleteProduct} />}
          </>
        ) : (
          <p>Você precisa estar autenticado para acessar esta página.</p>
        )}
      </Container>

      <DashBoardLogin show={showModal} handleClose={handleClose} setAuth={setAuth} />
      <AddProductModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        newProduct={newProduct}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        errorMessage={errorMessage}
        handleAddProduct={handleAddProduct}
      />
    </div>
  );
};

const ProductTable = ({ products, handleDeleteProduct }) => (
  <Table striped bordered hover className="mt-3">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Preço</th>
        <th>Quantidade</th>
        <th>Peso</th>
        <th>Imagem</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {products.map(product => (
        <tr key={`${product.id}-${product.nome}`}>
          <td>{product.id}</td>
          <td>{product.nome}</td>
          <td>{product.preco}</td>
          <td>{product.quantidade}</td>
          <td>{product.peso}</td>
          <td>
            {product.imagem_path ? <img src={product.imagem_path} alt={product.nome} style={{ width: '50px' }} /> : 'Imagem não disponível'}
          </td>
          <td><Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>Excluir</Button></td>
        </tr>
      ))}
    </tbody>
  </Table>
);

const AddProductModal = ({ show, handleClose, newProduct, handleInputChange, handleImageChange, errorMessage, handleAddProduct }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Adicionar Produto</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={(e) => e.preventDefault()}>
        {['nome', 'preco', 'quantidade', 'peso'].map((field) => (
          <Form.Group className="mb-3" key={field}>
            <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
            <Form.Control
              type={field === 'preco' || field === 'quantidade' ? 'number' : 'text'}
              name={field}
              value={newProduct[field]}
              onChange={handleInputChange}
            />
          </Form.Group>
        ))}
        <Form.Group className="mb-3">
          <Form.Label>Imagem</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>Fechar</Button>
      <Button variant="primary" onClick={handleAddProduct}>Salvar</Button>
    </Modal.Footer>
  </Modal>
);

export default DashBoard;
