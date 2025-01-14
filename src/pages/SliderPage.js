import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import axios from 'axios';

const backgroundStyle = {
  background: `url(/assets/imagem/background2.gif) repeat`,
  backgroundSize: 'auto, cover',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const SliderPage = () => {
  const [images, setImages] = useState([
    "/assets/imagem/slide1.jpg",
    "/assets/imagem/slide2.jpg",
    "/assets/imagem/slide3.jpg",
  ]);
  const [inputInterval, setInputInterval] = useState(''); // Inicializa o intervalo
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ isAuthenticated: true });

  // Verifica autenticação no carregamento
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setAuth({ isAuthenticated: true });
    } 
  }, []);

  // Função para alterar o valor do intervalo de tempo
  const handleIntervalChange = (event) => {
    const value = event.target.value;
    if (value === "" || !isNaN(value)) {
      setInputInterval(value);
    }
  };

  // Função para atualizar o intervalo de tempo no backend
  const handleApplyInterval = async () => {
    if (inputInterval && !isNaN(inputInterval) && parseInt(inputInterval, 10) > 0) {
      try {
        // Envia a solicitação PUT para o backend para atualizar o intervalo
        const response = await axios.put(
          'http://localhost:5000/lord',
          { intervalTime: parseInt(inputInterval, 10) },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true, // Envia as credenciais com a solicitação
          }
        );

        if (response.status === 200) {
          // Sucesso ao atualizar o intervalo no backend
          alert('Intervalo de tempo atualizado com sucesso!');
        }
      } catch (error) {
        alert('Erro ao atualizar o intervalo: ' + (error.response?.data?.message || error.message));
      }
    } else {
      alert('Por favor, insira um valor válido maior que 0.');
    }
  };

  // Função para alterar a imagem
  const handleImageChange = async (index, event, auth) => {
    // Verificar se o usuário está autenticado
    if (!auth.isAuthenticated) {
      alert('Você precisa estar autenticado para atualizar a imagem!');
      return;
    }
  
    const file = event.target.files[0]; // Pega o primeiro arquivo selecionado
  
    if (!file) {
      alert('Por favor, selecione uma imagem!');
      return;
    }
  
    const oldImagePath = images[index]; // Caminho da imagem atual
  
    // Verificar se o arquivo é uma imagem válida
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido!');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', file); // Certifique-se de que a imagem foi anexada corretamente
    formData.append('slideId', index + 1); // ID do slide (1, 2 ou 3)
    formData.append('oldImagePath', oldImagePath); // Caminho da imagem anterior
  
    // Log para verificar o conteúdo do FormData
    console.log('FormData enviado:', formData);
  
    try {
      const response = await fetch('http://localhost:5000/god', {
        method: 'PUT', // Método HTTP para a solicitação
        body: formData, // Passando formData diretamente como corpo
        credentials: 'include', // Envia as credenciais (cookies de autenticação) com a solicitação
      });
  
      console.log('Resposta do servidor:', response); // Log da resposta do servidor
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro no servidor:', errorData); // Exibe erro detalhado
        alert('Erro ao enviar a imagem: ' + (errorData.message || 'Erro desconhecido'));
        return;
      }
  
      const data = await response.json();
      console.log('Resposta bem-sucedida:', data); // Log da resposta de sucesso
  
      alert('Imagem atualizada com sucesso!');
      const newImages = [...images];
      newImages[index] = `${data.imagePath}?t=${new Date().getTime()}`;
      setImages(newImages); // Atualiza o estado das imagens
    } catch (error) {
      console.error('Erro ao enviar imagem:', error); // Log do erro de fetch
      alert('Erro ao enviar a imagem. Verifique o console para mais detalhes.');
    }
  };

  
  
  
  
  
  
  
  
  
  

  return (
    <div style={backgroundStyle}>
      <NavigationBar />
      <div className="container mt-5">
        <h1 className="text-center mb-4">Gerenciar Imagens do Slider</h1>
        <p>Recomendado largura de 1000px e altura de 194px, a imagem é responsiva e se adapta à resolução da tela.</p>
        <p>Atenção se a imagem estiver com o nome slied1, slied2 e slied3 ele vai carregar porém ira sair da página de login</p>

        <div className="row">
          {images.map((image, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <label htmlFor={`upload-${index}`} className="btn btn-primary">
                    Substituir Imagem
                  </label>
                  <input
                    type="file"
                    id={`upload-${index}`}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(event) => handleImageChange(index, event, auth)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h1 className="text-center mb-4">Gerenciar o tempo</h1>
          <p>Atenção: o tempo é em milissegundos, 1 segundo é igual a 1000</p>

          <label style={{ color: 'white', display: 'block', textAlign: 'center' }}>
            Intervalo de Tempo (ms):
          </label>
          <input
            type="number"
            className="form-control"
            value={inputInterval}
            onChange={handleIntervalChange}
            style={{ width: '150px', margin: '0 auto' }}
          />
          <button
            onClick={handleApplyInterval}
            className="btn btn-primary"
            style={{ margin: '0 auto', display: 'block' }}
          >
            Alterar Intervalo
          </button>
          <br /><br />
        </div>
      </div>
    </div>
  );
};

export default SliderPage;
