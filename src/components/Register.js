import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce'; // Biblioteca lodash para debounce
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Navbar.css'; // Importando o CSS Module
import { useAuth } from './AuthContext'; // Importando o contexto de autenticação
const Register = () => {
  const { login, storedIsLoggedIn, handleLogin  } = useAuth(); // Acessando a função de login do contexto
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: ''
  });

  const [errors, setErrors] = useState({
    cpf: '',
    cep: '',
    senha: '',
    confirmarSenha: '',
    numero: ''
  });
  
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Novo estado para login
  const [userName, setUserName] = useState(''); // Estado para armazenar o nome do usuário
  const navigate = useNavigate(); // Hook do React Router para navegação


  
  // Recuperar o nome do usuário e o estado de login do localStorage
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const storedUserName = localStorage.getItem('userName');
    if (token && storedUserName) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
    }
  }, []);

  // Função para formatar o CPF
  const formatCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length > 11) {
      cpf = cpf.slice(0, 11);
    }
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    } else if (cpf.length <= 9) {
      return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
  };

  const formatCEP = (cep) => {
    cep = cep.replace(/\D/g, '');
    if (cep.length > 5) {
      cep = cep.slice(0, 5) + '-' + cep.slice(5, 8);
    }
    return cep;
  };

  const isValidCEP = (cep) => {
    return /^\d{5}-\d{3}$/.test(cep);
  };

  const isValidCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    const invalidCPFs = [
      '00000000000', '11111111111', '22222222222', '33333333333',
      '44444444444', '55555555555', '66666666666', '77777777777',
      '88888888888', '99999999999'
    ];
    if (invalidCPFs.includes(cpf)) return false;

    let sum = 0;
    let rest;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf[i - 1]) * (11 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf[i - 1]) * (12 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf[10])) return false;

    return true;
  };

  const fetchAddressByCEP = async (cep) => {
    if (cep.length === 9) {
      setIsLoadingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
        const data = await response.json();
        if (data.erro) {
          setErrors((prevErrors) => ({ ...prevErrors, cep: 'CEP inválido' }));
        } else {
          setFormData({
            ...formData,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          });
          setErrors((prevErrors) => ({ ...prevErrors, cep: '' }));
        }
      } catch (error) {
        setErrors((prevErrors) => ({ ...prevErrors, cep: 'Erro ao buscar o CEP' }));
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        cpf: isValidCPF(formattedValue) ? '' : 'CPF inválido'
      }));
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        cep: formattedValue.replace(/\D/g, '').length === 8 ? '' : 'CEP inválido'
      }));
    }

    // Limitar a quantidade de caracteres no CPF e CEP
    if (name === 'cpf' && formattedValue.replace(/\D/g, '').length > 11) {
      formattedValue = formattedValue.slice(0, -1);
    } else if (name === 'cep' && formattedValue.replace(/\D/g, '').length > 10) {
      formattedValue = formattedValue.slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };


  const debouncedFetchAddress = debounce((cep) => {
    if (isValidCEP(cep)) {
      fetchAddressByCEP(cep);
    }
  }, 0); // Debounce ajustado para 1 segundo

  useEffect(() => {
    if (formData.cep) {
      debouncedFetchAddress(formData.cep);
    }
  }, [formData.cep]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'cep' && isValidCEP(value)) {
      fetchAddressByCEP(value);
    } else if (name === 'cep') {
      setErrors((prevErrors) => ({ ...prevErrors, cep: 'CEP inválido' }));
    }

    if (name === 'cpf') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        cpf: isValidCPF(value) ? '' : 'CPF inválido'
      }));
    }
  };

  
  const handleSubmit = async (event) => {
    event.preventDefault();

    const registrationData = {
      nome: formData.nome,
      email: formData.email,
      cpf: formData.cpf,
      senha: formData.senha,
      endereco: formData.endereco,
      cep: formData.cep,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
      complemento: formData.complemento,
    };

    try {
      const response = await registerUser(registrationData);
      handleRegistrationSuccess(response); // Chama a função de sucesso
    } catch (error) {
      handleRegistrationError(error);
    }
  };

  const registerUser = async (registrationData) => {
    try {
      const response = await axios.post('http://localhost:5000/register', registrationData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleRegistrationSuccess = (data) => {
    try {
      const { token, userName } = data || {};
      if (!token || !userName) {
        throw new Error('A resposta do servidor não contém o token ou o nome do usuário.');
      }

      // Chama a função de login do contexto e atualiza o estado
      login(userName, token);


      // Redireciona para a página principal sem a necessidade de um refresh
      

      alert(`Cadastro realizado com sucesso! Olá, ${userName}, seja bem-vindo(a)!`);

      navigate('/');

      window.location.reload();

    } catch (error) {
      console.error('Erro ao processar o sucesso do registro:', error);
      alert(`Erro ao realizar o cadastro: ${error.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.'}`);
    }
  };

  const handleRegistrationError = (error) => {
    if (error.response) {
      console.error('Erro na resposta da API:', error.response.data);
      alert(`Erro ao realizar o cadastro: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('Erro na requisição:', error.request);
      alert('Não foi possível se conectar ao servidor. Tente novamente mais tarde.');
    } else {
      console.error('Erro desconhecido:', error.message);
      alert(`Erro desconhecido: ${error.message}`);
    }
  };


  
  
  
  

  const labelStyle = {
    color: '#007FFF',
    fontSize: '20px',
    fontWeight: 'bold',
  };

  const inputStyle = (error) => ({
    padding: '10px',
    marginBottom: '10px',
    width: '100%',
    borderRadius: '5px',
    border: `1px solid ${error ? 'red' : '#ddd'}`
  });

  const buttonStyle = {
    backgroundColor: '#007FFF',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  return (
    <div style={{ marginTop: '50px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginTop:'30px', color:'#007FFF' }}>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nome" style={labelStyle}>Nome</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            style={inputStyle(errors.nome)}
            id="nome"
            placeholder="Nome"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle(errors.email)}
            id="email"
            placeholder="Email"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="senha" style={labelStyle}>Senha</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            style={inputStyle(errors.senha)}
            id="senha"
            placeholder="Senha"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmarSenha" style={labelStyle}>Confirmar Senha</label>
          <input
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            style={inputStyle(errors.confirmarSenha)}
            id="confirmarSenha"
            placeholder="Confirmar Senha"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="cpf" style={labelStyle}>CPF</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            onBlur={handleBlur}
            style={inputStyle(errors.cpf)}
            id="cpf"
            placeholder="CPF"
            required
          />
                    {errors.cpf && <span style={{ color: 'red' }}>{errors.cpf}</span>}

        </div>

        <div className="mb-3">
          <label htmlFor="cep" style={labelStyle}>CEP</label>
          <input
            type="text"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            onBlur={handleBlur}
            style={inputStyle(errors.cep)}
            id="cep"
            placeholder="CEP"
            required
          />
                    {errors.cep && <span style={{ color: 'red' }}>{errors.cep}</span>}

          {isLoadingCEP && <p>Carregando...</p>}
        </div>

        <div className="mb-3">
          <label htmlFor="endereco" style={labelStyle}>Endereço</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            readOnly
            style={inputStyle(errors.endereco)}
            id="endereco"
            placeholder="Endereço"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="numero" style={labelStyle}>Número</label>
          <input
            type="number"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            style={inputStyle(errors.numero)}
            id="numero"
            placeholder="Número"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="bairro" style={labelStyle}>Bairro</label>
          <input
            type="text"
            name="bairro"
            value={formData.bairro}
            readOnly
            style={inputStyle(errors.bairro)}
            id="bairro"
            placeholder="Bairro"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="cidade" style={labelStyle}>Cidade</label>
          <input
            type="text"
            name="cidade"
            value={formData.cidade}
            readOnly
            style={inputStyle(errors.cidade)}
            id="cidade"
            placeholder="Cidade"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="estado" style={labelStyle}>Estado</label>
          <input
            type="text"
            name="estado"
            value={formData.estado}
            readOnly
            style={inputStyle(errors.estado)}
            id="estado"
            placeholder="Estado"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="complemento" style={labelStyle}>Complemento(Opicional)</label>
          <input
            type="text"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            style={inputStyle(errors.complemento)}
            id="complemento"
            placeholder="Complemento"
          />
        </div>

        <button   className="button-custom"  type="submit" style={buttonStyle}>Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;
