import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import DashBoardNavigationBar from '../components/NavigationBar';


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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setAuth({ isAuthenticated: true });
    } else {
      setShowAddModal(false);
    }
    
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/produtos`, { withCredentials: true });
      setProducts(response.data);
    } catch (error) {
      setErrorMessage('Erro ao buscar produtos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setNewProduct({ ...product });
    setShowEditModal(true);
  };

  const handleProductUpdated = () => fetchProducts();

  const handleImageChange = async (event) => {
    const imageFile = event.target.files[0];
    if (!imageFile) return setNewProduct({ ...newProduct, imagem: null });

    try {
      const compressedFile = await imageCompression(imageFile, { maxSizeMB: 0.3, maxWidthOrHeight: 800 });
      setNewProduct({ ...newProduct, imagem: compressedFile });
    } catch (error) {
      setErrorMessage('Erro ao processar a imagem.');
      setNewProduct({ ...newProduct, imagem: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    if (!newProduct.nome || !newProduct.preco  || !newProduct.peso || !newProduct.imagem) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }
else if({isAuthenticated: true})
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('nome', newProduct.nome);
      formData.append('preco', parseFloat(newProduct.preco).toFixed(2));
      formData.append('quantidade', 1);
            formData.append('peso', parseFloat(newProduct.peso).toFixed(2));
      formData.append('imagem', newProduct.imagem);

      const response = await axios.post(`${API_URL}/produtos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      setProducts((prev) => [...prev, response.data]);
      resetNewProduct();
      setShowAddModal(false);
      await fetchProducts();
    } catch (error) {
      setErrorMessage('Erro ao adicionar o produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();
    if (!newProduct.nome || !newProduct.preco || !newProduct.quantidade || !newProduct.peso || !newProduct.imagem) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('nome', newProduct.nome);
      formData.append('preco', parseFloat(newProduct.preco).toFixed(2));
      formData.append('quantidade', 1);
      formData.append('peso', parseFloat(newProduct.peso).toFixed(2));
      formData.append('imagem', newProduct.imagem);

      const response = await axios.put(`${API_URL}/produtos/${selectedProduct.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      setProducts((prev) => prev.map((product) => (product.id === selectedProduct.id ? response.data : product)));
      resetNewProduct();
      setShowEditModal(false);
      await fetchProducts();
    } catch (error) {
      setErrorMessage('Erro ao atualizar o produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewProduct = () => {
    setNewProduct({ nome: '', preco: '', quantidade: '', peso: '', imagem: null });
    setErrorMessage('');
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

  return (
    <div style={backgroundStyle2}>
      <DashBoardNavigationBar />
      <Container className="dashboard-content">
        {auth.isAuthenticated ? (
          <>
            <h1 className="mt-3 text-center">Bem-vindo à sua área administrativa</h1>
            <h1>Os 5 Produtos da página principal</h1>
            {isLoading ? <Spinner animation="border" className="mt-3" /> : <ProductTable products={products} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} />}
            <h1 className="mt-5">Produtos adicionais</h1>

            <Button variant="primary" onClick={() => setShowAddModal(true)} className="mt-3">
              Adicionar Produto
            </Button>
            {isLoading ? <Spinner animation="border" className="mt-3" /> : <AllProductsTable products={products} onDeleteProduct={handleDeleteProduct} />}
          </>
        ) : (
          <p>Você precisa estar autenticado para acessar esta página.</p>
        )}
      </Container>
      <AddProductModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        newProduct={newProduct}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        errorMessage={errorMessage}
        handleSubmit={handleAddProduct}
      />
      <AddProductModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        newProduct={newProduct}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        errorMessage={errorMessage}
        handleSubmit={handleUpdateProduct}
      />

    </div>
  );
};

const ProductTable = ({ products, onEditProduct }) => {
  const limitedProducts = products.slice(0, 5); // Limita para os primeiros 5 produtos

  return (
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Preço</th>
          <th>Peso em gramas</th>
          <th>Imagem</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {limitedProducts.map((product) => (
          <tr key={product.id}>
            <td>{product.id}</td>
            <td>{product.nome}</td>
            <td>{product.preco}</td>
            <td>{product.peso}</td>
            <td>
              {product.imagem_path ? (
                <img src={product.imagem_path} alt={product.nome} style={{ width: '50px' }} />
              ) : (
                'Imagem não disponível'
              )}
            </td>
            <td>
              <Button variant="primary" onClick={() => onEditProduct(product)}>Atualizar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const AllProductsTable = ({ products, onDeleteProduct }) => (
  <Table striped bordered hover className="mt-3">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Preço</th>
        <th>Peso em gramas</th>
        <th>Imagem</th>
        <th>Ação</th>
      </tr>
    </thead>
    <tbody>
      {products
        .filter((product) => product.id > 5)
        .map((product) => (
          <tr key={product.id}>
            <td>{product.id}</td>
            <td>{product.nome}</td>
            <td>{product.preco}</td>
            <td>{product.peso}</td>
            <td>
              {product.imagem_path ? (
                <img src={product.imagem_path} alt={product.nome} style={{ width: '50px' }} />
              ) : (
                'Imagem não disponível'
              )}
            </td>
            <td>
              <Button variant="danger" onClick={() => onDeleteProduct(product.id)}>Excluir</Button>
            </td>
          </tr>
        ))}
    </tbody>
  </Table>
);

const AddProductModal = ({ show, handleClose, newProduct, handleInputChange, handleImageChange, errorMessage, handleSubmit }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>{newProduct.id ? 'Editar Produto' : 'Adicionar Produto'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formNome">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            name="nome"
            value={newProduct.nome}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="formPreco">
          <Form.Label>Preço</Form.Label>
          <Form.Control
            type="text"
            name="preco"
            value={newProduct.preco}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        
        <Form.Group controlId="formPeso">
          <Form.Label>Peso em gramas</Form.Label>
          <Form.Control
            type="text"
            name="peso"
            value={newProduct.peso}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="formImagem">
          <Form.Label>Imagem</Form.Label>
          <Form.Control type="file" onChange={handleImageChange} />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          {newProduct.id ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
      </Form>
    </Modal.Body>
  </Modal>
);

export default DashBoard;
