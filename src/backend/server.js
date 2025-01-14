const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carregar variáveis de ambiente
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fsPromises = require('fs/promises');
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');
// Conexão com o banco de dados usando variáveis de ambiente
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Configuração do app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  // Permite todas as origens
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Permite esses métodos
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // Permite os cabeçalhos
 

  next();  // Passa para a próxima função/middleware
});

app.use(cors({
  
  origin: 'http://localhost:3000', // Permite o acesso do frontend
  credentials: true,              // Permite cookies/sessões
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos específicos
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permite os métodos desejados
}));

app.options('*', cors());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Configuração de sessão
app.use(session({
  secret: 'jesus', // Chave secreta para assinar o ID da sessão
  resave: false,    // Não força a regravação da sessão se não houver alterações
  saveUninitialized: false, // Salva sessões não modificadas
  cookie: {
    secure: false, // Deve ser 'true' se você estiver usando HTTPS
    httpOnly: true, // Impede o acesso ao cookie via JavaScript
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'None', // Pode ser 'None', 'Lax', ou 'Strict' dependendo das necessidades // Define o tempo de expiração do cookie (1 dia)
  },
}));

// Outras configurações e rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Função para carregar as chaves do arquivo
// Função para validar CEP
const isValidCep = (cep) => {
  const sanitizedCep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
  return sanitizedCep.length === 8; // Verifica se tem exatamente 8 dígitos
};

function getCircularReplacer() {
  const seen = [];
  return function (key, value) {
    if (value != null && typeof value === 'object') {
      if (seen.indexOf(value) >= 0) {
        return;
      }
      seen.push(value);
    }
    return value;
  };
}


// Função para criar tabelas no banco, incluindo carrinho

// Função para criar tabelas e inserir dados
const createTablesIfNotExist = async () => {
  try {
    // Definição de queries para criação das tabelas
    const queries = [
      `
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          senha VARCHAR(100) NOT NULL,
          cpf VARCHAR(14) NOT NULL UNIQUE,
          cep VARCHAR(10) NOT NULL,
          endereco VARCHAR(255),
          estado VARCHAR(100),
          cidade VARCHAR(100),
          bairro VARCHAR(100),
          numero VARCHAR(10) NOT NULL,
          complemento VARCHAR(255)
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS produtos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          preco DECIMAL(10, 2) NOT NULL,
          quantidade INT NOT NULL,
          peso INT NOT NULL,
          imagem_path VARCHAR(255)
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS carrinho (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          produto_id INT NOT NULL,
          quantidade INT NOT NULL,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS slide_imagem (
          id INT AUTO_INCREMENT PRIMARY KEY,
          imagem VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS carousel_interval (
          id INT AUTO_INCREMENT PRIMARY KEY,
          interval_time INT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `,
      // Criação da tabela api_keys se não existir
      `
        CREATE TABLE IF NOT EXISTS api_keys (
          id INT AUTO_INCREMENT PRIMARY KEY,
          mercadoPagoKey VARCHAR(255) NOT NULL,
          correiosKey VARCHAR(255) NOT NULL
        );
      `
    ];

    // Executar todas as queries para criar as tabelas
    for (const query of queries) {
      await connection.promise().query(query);
    }
    console.log('Tabelas criadas ou já existentes.');

    // Verificar se a tabela slide_imagem está vazia
    const [slideImagemResults] = await connection.promise().query('SELECT COUNT(*) AS count FROM slide_imagem');
    if (slideImagemResults[0].count === 0) {
      // Inserir as imagens padrão na tabela slide_imagem
      const slideImages = [
        '/assets/imagem/slide1.jpg',
        '/assets/imagem/slide2.jpg',
        '/assets/imagem/slide3.jpg'
      ];

      for (let image of slideImages) {
        await connection.promise().query('INSERT INTO slide_imagem (imagem) VALUES (?)', [image]);
      }
      console.log('Imagens padrão inseridas na tabela "slide_imagem".');
    }

    // Verificar se a tabela carousel_interval está vazia
    const [carouselResults] = await connection.promise().query('SELECT COUNT(*) AS count FROM carousel_interval');
    if (carouselResults[0].count === 0) {
      // Criar o objeto JSON para armazenar na tabela carousel_interval
      const jsonData = {
        id: 1,
        interval_time: 2000,
        updated_at: new Date()
      };

      // Inserir o objeto JSON na tabela carousel_interval
      await connection.promise().query(
        'INSERT INTO carousel_interval (id, interval_time, updated_at) VALUES (?, ?, ?)',
        [jsonData.id, jsonData.interval_time, jsonData.updated_at]
      );
      console.log('Registro inicial inserido na tabela "carousel_interval".');
    }

    // Verificar se a tabela api_keys está vazia
    const [apiKeysResults] = await connection.promise().query('SELECT COUNT(*) AS count FROM api_keys');
    if (apiKeysResults[0].count === 0) {
      // Inserir as chaves padrão na tabela api_keys
      const defaultKeys = {
        mercadoPagoKey: 'teste_mercado_pago',
        correiosKey: 'teste_correios'
      };

      await connection.promise().query(
        'INSERT INTO api_keys (mercadoPagoKey, correiosKey) VALUES (?, ?)',
        [defaultKeys.mercadoPagoKey, defaultKeys.correiosKey]
      );
      console.log('Chaves padrão inseridas na tabela "api_keys".');
    }

  } catch (err) {
    console.error('Erro ao criar tabelas ou inserir dados:', err);
  }
};

// Executar a função para criar as tabelas e inserir os dados
createTablesIfNotExist();




// Função auxiliar: buscar endereço pelo CEP
const getAddressByCep = async (cep) => {
  const sanitizedCep = cep.replace('-', ''); // Remove o traço do CEP
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${sanitizedCep}/json/`);
    if (data.erro) throw new Error('CEP inválido ou não encontrado');
    return {
      endereco: data.logradouro,
      estado: data.uf,
      cidade: data.localidade,
      bairro: data.bairro,
    };
  } catch (error) {
    throw new Error('Erro ao buscar endereço pelo CEP');
  }
};

const generateToken = (userData) => {
  const payload = { id: userData.id, nome: userData.nome, email: userData.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Rota: Cadastro de Usuário
app.post('/register', async (req, res) => {
  const { nome, email, senha, cpf, cep, numero, complemento } = req.body;

  // Verifica se todos os campos obrigatórios estão presentes
  if (!nome || !email || !senha || !cpf || !cep || !numero) {
    return res.status(400).json(JSON.parse(JSON.stringify({
      message: 'Nome, Email, Senha, CPF, CEP e Número são obrigatórios'
    }, getCircularReplacer())));
  }

  // Sanitiza e valida o CEP
  const sanitizedCep = cep.replace(/\D/g, ''); // Remove tudo que não for número
  if (!isValidCep(sanitizedCep)) {
    return res.status(400).json(JSON.parse(JSON.stringify({
      message: 'Formato de CEP inválido. O CEP deve ter 8 dígitos numéricos.'
    }, getCircularReplacer())));
  }

  try {
    // Busca o endereço a partir do CEP
    const { endereco, estado, cidade, bairro } = await getAddressByCep(sanitizedCep);

    // Verifica se o email ou CPF já estão cadastrados
    const checkUserQuery = 'SELECT * FROM usuarios WHERE email = ? OR cpf = ?';
    connection.query(checkUserQuery, [email, cpf], (err, results) => {
      if (err) {
        console.error('Erro ao verificar usuário:', err);
        return res.status(500).json(JSON.parse(JSON.stringify({
          message: 'Erro ao verificar usuário',
          error: err
        }, getCircularReplacer())));
      }

      // Se já existir usuário com o mesmo email ou CPF
      if (results.length > 0) {
        return res.status(400).json(JSON.parse(JSON.stringify({
          message: 'Email ou CPF já cadastrado'
        }, getCircularReplacer())));
      }

      // Insere o novo usuário no banco de dados
      const insertUserQuery = `
        INSERT INTO usuarios (nome, email, senha, cpf, cep, endereco, estado, cidade, bairro, numero, complemento) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      connection.query(
        insertUserQuery,
        [nome, email, senha, cpf, sanitizedCep, endereco, estado, cidade, bairro, numero, complemento],
        (err, results) => {
          if (err) {
            console.error('Erro ao cadastrar usuário:', err);
            return res.status(500).json(JSON.parse(JSON.stringify({
              message: 'Erro ao cadastrar usuário',
              error: err
            }, getCircularReplacer())));
          }
// Rota para listar os itens do carrinho de um usuário



// Rota para obter as credenciais atuais



// Rota para listar os itens do carrinho
app.get('/cart/id', async (req, res) => {
  const { usuario_id } = req.query;  // Assume que o usuário envia o usuario_id via query string

  try {
    const query = `
      SELECT c.id 
      FROM carrinho c
      WHERE c.usuario_id = ?
    `;

    connection.query(query, [usuario_id], (error, results) => {
      if (error) {
        console.error('Erro ao buscar ID do carrinho:', error.message);
        return res.status(500).json({ error: 'Erro ao buscar ID do carrinho.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Carrinho não encontrado para este usuário.' });
      }

      // Retorna o ID do carrinho
      res.status(200).json(results[0]);  // Retorna o primeiro resultado, que é o ID do carrinho
    });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro ao buscar ID do carrinho.' });
  }
});








// Rota para atualizar a quantidade de um item no carrinho
app.put('/cart/:id', (req, res) => {
  const cartItemId = req.params.id; // ID do item no carrinho
  const { quantidade } = req.body;

  if (!quantidade) {
    return res.status(400).json({ error: 'Quantidade é obrigatória.' });
  }

  const updateQuery = `
    UPDATE carrinho 
    SET quantidade = ? 
    WHERE id = ?
  `;

  connection.query(updateQuery, [quantidade, cartItemId], (error, result) => {
    if (error) {
      console.error('Erro ao atualizar item no carrinho:', error.message);
      return res.status(500).json({ error: 'Erro ao atualizar item no carrinho.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item do carrinho não encontrado.' });
    }

    res.json({ message: 'Item do carrinho atualizado com sucesso!' });
  });
});
          // Cria um objeto de usuário com apenas dados essenciais, sem referências cíclicas
          const user = { id: results.insertId, nome, email };

          // Gera o token JWT para o usuário
          const token = generateToken(user);

          // Retorna a resposta com o token e o nome do usuário
          res.status(201).json(JSON.parse(JSON.stringify({
            message: 'Usuário cadastrado com sucesso',
            token: token, // Envia o token para o frontend
            userName: user.nome, // Envia o nome do usuário
            userEmail: user.email, // Envia o email do usuário
          }, getCircularReplacer())));
        }
      );
    });
  } catch (error) {
    console.error('Erro ao buscar o endereço pelo CEP:', error.message);
    res.status(500).json(JSON.parse(JSON.stringify({
      message: error.message
    }, getCircularReplacer())));
  }
});


// ** Rota para verificar autenticação **
app.get('/check-auth', (req, res) => {
  res.json({
      isAuthenticated: !!req.session.isAuthenticated, // Converte para booleano explicitamente
      user: req.session.isAuthenticated ? req.session.user : null, // Retorna null se não autenticado
  });
});



// Inicializar o servidor

// ** Rota de logout **
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error('Erro ao encerrar sessão:', err);
          return res.status(500).json({ error: 'Erro ao encerrar sessão' });
      }
      res.json({ message: 'Logout realizado com sucesso!' });
  });
});
app.get('/shalom/:userId/cep', (req, res) => {
  const userId = req.params.userId;

  // Consulta para buscar o CEP
  const query = 'SELECT cep FROM usuarios WHERE id = ?';

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).json({ error: 'Erro ao buscar o CEP do usuário.' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }

    // Retorna o CEP encontrado
    const cep = results[0].cep;
    res.json({ cep });
  });
});
app.post('/cart', (req, res) => {
  const { usuario_id, produto_id, quantidade } = req.body;

  if (!usuario_id || !produto_id || !quantidade) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Verificar se o produto já está no carrinho
  const checkQuery = `
    SELECT * FROM carrinho 
    WHERE usuario_id = ? AND produto_id = ?
  `;
  
  connection.query(checkQuery, [usuario_id, produto_id], (error, results) => {
    if (error) {
      console.error('Erro ao verificar produto no carrinho:', error.message);
      return res.status(500).json({ error: 'Erro ao verificar o produto no carrinho' });
    }

    if (results.length > 0) {
      // Se o produto já estiver no carrinho, atualiza a quantidade
      const updateQuery = `
        UPDATE carrinho 
        SET quantidade = quantidade + ?
        WHERE usuario_id = ? AND produto_id = ?
      `;
      connection.query(updateQuery, [quantidade, usuario_id, produto_id], (updateError) => {
        if (updateError) {
          console.error('Erro ao atualizar o carrinho:', updateError.message);
          return res.status(500).json({ error: 'Erro ao atualizar o carrinho' });
        }
        // Recuperar os dados do produto atualizado
        const selectProductQuery = `
          SELECT p.* FROM produtos p
          JOIN carrinho c ON p.id = c.produto_id
          WHERE c.usuario_id = ? AND c.produto_id = ?
        `;
        connection.query(selectProductQuery, [usuario_id, produto_id], (selectProductError, productData) => {
          if (selectProductError) {
            console.error('Erro ao recuperar dados do produto:', selectProductError.message);
            return res.status(500).json({ error: 'Erro ao recuperar dados do produto' });
          }
          return res.json({ message: 'Quantidade atualizada no carrinho!', produto: productData });
        });
      });
    } else {
      // Se o produto não estiver no carrinho, insere um novo item
      const insertQuery = `
        INSERT INTO carrinho (usuario_id, produto_id, quantidade)
        VALUES (?, ?, ?)
      `;
      connection.query(insertQuery, [usuario_id, produto_id, quantidade], (insertError) => {
        if (insertError) {
          console.error('Erro ao adicionar produto ao carrinho:', insertError.message);
          return res.status(500).json({ error: 'Erro ao adicionar produto ao carrinho' });
        }
        // Recuperar os dados do produto adicionado
        const selectProductQuery = `
          SELECT * FROM produtos WHERE id = ?
        `;
        connection.query(selectProductQuery, [produto_id], (selectProductError, productData) => {
          if (selectProductError) {
            console.error('Erro ao recuperar dados do produto:', selectProductError.message);
            return res.status(500).json({ error: 'Erro ao recuperar dados do produto' });
          }
          return res.status(201).json({ message: 'Produto adicionado ao carrinho!', produto: productData });
        });
      });
    }
  });
});

// Ou carregue os itens de algum banco de dados ou persistência

app.delete('/cart/:id', (req, res) => {
  const { id } = req.params;

  console.log(`Tentando remover o item com ID: ${id}`);

  // Conexão ao banco de dados
  connection.query('DELETE FROM carrinho WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).json({ message: 'Erro ao remover o item do carrinho.' });
    }

    if (result.affectedRows > 0) {
      console.log('Item removido com sucesso:', id);
      return res.status(200).json({ message: 'Item removido com sucesso.' });
    } else {
      console.log(`Item com ID ${id} não encontrado no carrinho.`);
      return res.status(404).json({ message: 'Item não encontrado no carrinho.' });
    }
  });
});
app.get('/cart/:userId', (req, res) => {
  const { userId } = req.params;

  // Verifica se o userId é válido
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'ID do usuário inválido' });
  }

  // Consulta os itens do carrinho com quantidade e preço
  const query = `
    SELECT c.id, p.nome AS product_name, p.preco AS product_price, c.quantidade, 
           (c.quantidade * p.preco) AS total_price, p.imagem_path 
    FROM carrinho c
    JOIN produtos p ON c.produto_id = p.id
    WHERE c.usuario_id = ?;
  `;

  // Usando connection.query() para realizar a consulta
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar carrinho:', err);
      return res.status(500).json({ error: 'Erro ao buscar carrinho' });
    }
    res.json(results); // Retorna os itens do carrinho
  });
});
app.get('/produtos/:id', (req, res) => {
  const produtoId = req.params.id;
  const query = 'SELECT * FROM produtos WHERE id = ?';

  connection.query(query, [produtoId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar o produto:', err);
      return res.status(500).json({ error: 'Erro ao buscar o produto.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json(results[0]); // Retorna o primeiro produto encontrado
  });
});
// Express route to get product by ID


// Iniciar o servidor
app.get('/jeova', async (req, res) => {
  try {
    // Consulta para obter as chaves da tabela api_keys
    const [rows] = await connection.promise().query('SELECT * FROM api_keys ');
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Chaves não encontradas.' });
    }

    // Retorna as chaves encontradas
    return res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao obter as chaves:', error);
    return res.status(500).json({ message: 'Erro ao obter as chaves.' });
  }
});

// Método PUT para atualizar as chaves na tabela api_keys
app.put('/jeova', async (req, res) => {
  const { mercadoPagoKey, correiosKey } = req.body;

  // Verificar se as chaves foram fornecidas
  if (!mercadoPagoKey || !correiosKey) {
    return res.status(400).json({ message: 'As chaves mercadoPagoKey e correiosKey são necessárias.' });
  }

  try {
    // Atualizar as chaves na tabela api_keys
    const [result] = await connection.promise().query(
      'UPDATE api_keys SET mercadoPagoKey = ?, correiosKey = ? WHERE id = 1',
      [mercadoPagoKey, correiosKey]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Chaves não encontradas para atualização.' });
    }

    // Retorna uma resposta de sucesso
    return res.json({ message: 'Chaves atualizadas com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar as chaves:', error);
    return res.status(500).json({ message: 'Erro ao atualizar as chaves.' });
  }
});

// ** Listar produtos **
app.get('/produtos', (req, res) => {
  const query = `SELECT id, nome, preco, quantidade, peso, imagem_path FROM produtos`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar produtos:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
    res.json(results);
  });
});

// Rota para cadastrar produto
;
// Configuração do multer para upload de imagens
// Configuração do multer para armazenar imagens em 'public/assets/imagem'

// Função para determinar o armazenamento com base no tipo
// Configuração de armazenamento para a pasta 'imagem'
// Configuração do Multer para armazenar o arquivo
const imageMap = {
  slide1: 'slide1.jpg',
  slide2: 'slide2.jpg',
  slide3: 'slide3.jpg',
};

const imagemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'public', 'assets', 'imagem'));
  },
});





const upload = multer({
  storage: imagemStorage,
  dest: path.join(__dirname, '..', '..', 'public', 'assets', 'imagem'), // Caminho para o diretório do front-end  
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/gif' || 
        file.mimetype === 'image/jpg') {
      cb(null, true); // Aceita o arquivo
    } else {
      cb(null, false); // Rejeita o arquivo
      return cb(new Error('Apenas imagens JPEG, PNG, JPG e GIF são permitidas')); // Retorna um erro
    }
  }
});


// Rota para inserir um novo produto
app.post('/produtos', upload.single('imagem'), (req, res) => {
  console.time('[DEBUG] Tempo total de processamento');

  const { nome, preco, quantidade, peso } = req.body;
  const imagem = req.file;

  // Validação dos campos do formulário
  if (!nome || !preco || !quantidade || !peso || !imagem) {
    console.timeEnd('[DEBUG] Tempo total de processamento');
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const relativeImagePath = `assets/imagem/${imagem.filename}`;
  const precoNum = Number(preco);
  const quantidadeNum = Number(quantidade);
  const pesoNum = Number(peso);

  // Validação dos valores numéricos
  if (isNaN(precoNum) || isNaN(quantidadeNum) || isNaN(pesoNum)) {
    console.timeEnd('[DEBUG] Tempo total de processamento');
    return res.status(400).json({ error: 'Preço, quantidade e peso devem ser números válidos.' });
  }

  const query = `INSERT INTO produtos (nome, preco, quantidade, peso, imagem_path) VALUES (?, ?, ?, ?, ?)`;
  const values = [nome, precoNum, quantidadeNum, pesoNum, relativeImagePath];

  // Executa a query no banco de dados
  connection.query(query, values, (error, result) => {
    if (error) {
      console.error("Erro na inserção do produto:", error);
      console.timeEnd('[DEBUG] Tempo total de processamento');
      return res.status(500).json({ error: 'Erro ao inserir produto no banco de dados.' });
    }

    // Retorna a resposta de sucesso
    res.status(201).json({
      message: 'Produto cadastrado com sucesso!',
      produto: {
        id: result.insertId,
        nome,
        preco: precoNum,
        quantidade: quantidadeNum,
        peso: pesoNum,
        imagem_path: relativeImagePath,
      },
    });
    console.timeEnd('[DEBUG] Tempo total de processamento');
  });
});

// Middleware para lidar com erros de Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  } else if (error) {
    console.error("Erro geral no Multer:", error);
    return res.status(500).json({ error: 'Erro ao processar o upload do arquivo.' });
  }
  next();
});
app.get('/slied', async (req, res) => {
  try {
    // Consulta para pegar todas as imagens na tabela slide_imagem
    const [results] = await connection.promise().query('SELECT imagem FROM slide_imagem');
    
    // Verifica se existem imagens
    if (results.length > 0) {
      const images = results.map(row => row.imagem); // Mapeia as imagens para um array
      return res.status(200).json(images); // Retorna as imagens como JSON
    } else {
      return res.status(404).json({ error: 'Nenhuma imagem encontrada.' });
    }
  } catch (err) {
    console.error('Erro ao buscar imagens:', err);
    return res.status(500).json({ error: 'Erro ao buscar imagens.' });
  }
});


// Middleware global do multer



// Ajuste a configuração do Multer para salvar a imagem no diretório público do front-end

app.get('/users', (req, res) => {
  const { nome } = req.query; // Captura o nome enviado na query string
  const query = 'SELECT * FROM usuarios WHERE nome LIKE ?';

  connection.query(query, [`%${nome}%`], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ error: 'Erro ao buscar os usuários' });
    }
    res.json(results);
  });
});
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;

  // Query para buscar o usuário pelo ID
  const query = 'SELECT * FROM usuarios WHERE id = ?';

  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }

    if (result.length > 0) {
      // Se o usuário for encontrado
      res.status(200).json(result[0]);
    } else {
      // Se o usuário não for encontrado
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  });
});

app.get('/frete/:cep', async (req, res) => {
  const { cep } = req.params;
  const { tipo = '04014' } = req.query;

  // Validações básicas
  if (!cep || cep.length !== 8) {
    return res.status(400).json({ error: 'CEP inválido fornecido' });
  }

  if (!['04014', '04510'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de serviço inválido' });
  }

  try {
    // Define valores fixos para os tipos de frete
    const valoresFrete = {
      '04014': 30.0, // Sedex
      '04510': 15.0, // PAC
    };

    // Obtém o valor correspondente ao tipo de frete
    const valorFrete = valoresFrete[tipo];

    // Retorna o valor do frete
    res.json({
      cepDestino: cep,
      tipoServico: tipo === '04014' ? 'Sedex' : 'PAC',
      valor: valorFrete,
    });
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    res.status(500).json({
      error: 'Erro ao calcular frete',
      detalhes: error.message || error,
    });
  }
});




app.put('/god', upload.single('image'), async (req, res) => {
  const slideId = parseInt(req.body.slideId, 10);
  const oldImagePath = req.body.oldImagePath;

  // Validações iniciais
  if (!req.file) {
    return res.status(400).send({ error: 'Nenhuma imagem foi enviada.' });
  }

  if (!slideId || slideId < 1 || slideId > 3) {
    return res.status(400).send({ error: 'ID do slide inválido. Deve ser 1, 2 ou 3.' });
  }

  // Caminho fixo para o novo arquivo
  const newFileName = `slide${slideId}.jpg`;  // Nome fixo baseado no slideId
  const newImagePath = `/assets/imagem/${newFileName}`;

  // Caminho absoluto no sistema de arquivos (no diretório público do front-end)
  const uploadDir = path.join(__dirname, '..', '..', 'public', 'assets', 'imagem');  // Diretório onde a imagem será movida
  const oldFilePath = req.file.path;  // Caminho do arquivo temporário
  const newFilePath = path.join(uploadDir, newFileName);

  // Verificação dos caminhos
  console.log('Caminho do arquivo temporário:', oldFilePath);
  console.log('Caminho do novo arquivo:', newFilePath);
  console.log('Diretório de upload:', uploadDir);

  try {
    // Verificar se o diretório de destino existe, caso contrário, criar
    if (!fs.existsSync(uploadDir)) {
      console.log('Diretório de destino não existe. Criando...');
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Verificar se o arquivo temporário realmente existe
    if (!fs.existsSync(oldFilePath)) {
      console.error('Arquivo temporário não encontrado:', oldFilePath);
      return res.status(500).send({ error: 'Arquivo não encontrado no caminho temporário.' });
    }

    // Verificar se o arquivo já existe no destino e remover
    if (fs.existsSync(newFilePath)) {
      console.log('Arquivo de destino já existe. Removendo...');
      await fsPromises.unlink(newFilePath);  // Remove o arquivo antigo
    }

    // Renomear o arquivo para o novo nome
    await fsPromises.rename(oldFilePath, newFilePath);

    // Verificar se o arquivo foi movido com sucesso
    if (fs.existsSync(newFilePath)) {
      console.log('Arquivo movido com sucesso:', newFilePath);
    } else {
      console.error('Falha ao mover o arquivo.');
      return res.status(500).send({ error: 'Falha ao mover o arquivo.' });
    }

    // Atualizar o caminho da imagem no banco de dados
    const [results] = await connection.promise().query(
      'UPDATE slide_imagem SET imagem = ? WHERE id = ?',
      [newImagePath, slideId]
    );

    if (results.affectedRows > 0) {
      return res.status(200).send({
        message: 'Imagem atualizada com sucesso!',
        imagePath: newImagePath,
      });
    } else {
      return res.status(404).send({ error: 'Slide não encontrado.' });
    }
  } catch (err) {
    console.error('Erro ao processar a imagem:', err);
    return res.status(500).send({ error: `Erro ao atualizar a imagem: ${err.message}` });
  }
});

app.get('yeshua', (req, res) => {
  const imagePaths = [
    '/assets/imagem/slide1.jpg',
    '/assets/imagem/slide2.jpg',
    '/assets/imagem/slide3.jpg',
  ];

  res.json({ images: imagePaths });
});
// ** Rota para atualizar produto existente **
app.put('/produtos/:id', upload.single('imagem'), (req, res, next) => {
  const { id } = req.params;
  const { nome, preco, quantidade, peso } = req.body;
  // Caminho relativo CORRETO (sem /public)
  const imagem_path = req.file ? `assets/imagem/${req.file.filename}` : null;

  if (!nome && !preco && !quantidade && !peso && !imagem_path) {
      return res.status(400).json({ error: 'Nenhuma informação foi fornecida para atualizar o produto' });
  }

  const updates = [];
  const values = [];

  if (nome) {
      updates.push('nome = ?');
      values.push(nome);
  }
  if (preco) {
      updates.push('preco = ?');
      values.push(preco);
  }
  if (quantidade) {
      updates.push('quantidade = ?');
      values.push(quantidade);
  }
  if (peso) {
      updates.push('peso = ?');
      values.push(peso);
  }
  if (imagem_path) {
      updates.push('imagem_path = ?');
      values.push(imagem_path); // Salva o caminho relativo
  }

  values.push(id);

  const query = `UPDATE produtos SET ${updates.join(', ')} WHERE id = ?`;

  connection.query(query, values, (error, result) => {
      if (error) {
          console.error('Erro ao atualizar produto:', error); // Log do erro completo
          return res.status(500).json({ error: 'Erro ao atualizar produto' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Produto não encontrado' });
      }

      return res.json({ message: 'Produto atualizado com sucesso!' });
  });
}, (err, req, res, next) => { // Middleware de tratamento de erro do Multer
  if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Tamanho do arquivo excede o limite de 5MB.' });
      }
      return res.status(400).json({ error: 'Erro no upload do arquivo: ' + err.message });
  } else if (err) {
      console.error("Erro no upload:", err);
      return res.status(500).json({ error: 'Erro ao processar o upload.' });
  }
  next(err);
});

app.get('/lord', (req, res) => {
  // Imprime informações sobre a requisição
  console.log('Corpo da requisição (body):', req.body); // Para POST ou outras requisições com body
  console.log('Parâmetros da URL (params):', req.params); // Parâmetros na URL, se houver
  console.log('Query da requisição (query):', req.query); // Query parameters (caso use ?param=value na URL)

  const query = `SELECT interval_time FROM carousel_interval`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar produtos:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
    
    // Mostra o resultado da consulta
    console.log('Resultados da consulta:', results);
    res.json(results);
  });
});
app.put('/lord', (req, res) => { // Rota PUT sem ID
  const newIntervalTime = req.body.intervalTime; // Corrigido para intervalTime (como no frontend)

  if (!newIntervalTime || isNaN(Number(newIntervalTime)) || Number(newIntervalTime) <= 0) {
      return res.status(400).json({ error: 'Intervalo inválido. Deve ser um número maior que zero.' });
  }

  const query = `UPDATE carousel_interval SET interval_time = ?`; // Sem WHERE, atualiza o primeiro registro ou o único.
  connection.query(query, [newIntervalTime], (error, results) => {
      if (error) {
          console.error('Erro ao atualizar intervalo:', error.message);
          return res.status(500).json({ error: 'Erro ao atualizar intervalo' });
      }

      console.log('Resultados da atualização:', results);
      res.json({ message: 'Intervalo atualizado com sucesso', results });
  });
});
// ** Remover produto **
app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM produtos WHERE id = ?`;
  connection.query(query, [id], (error, result) => {
    if (error) {
      console.error('Erro ao remover produto:', error.message);
      return res.status(500).json({ error: 'Erro ao remover produto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto removido com sucesso!' });
  });
});
// Rota: Login de Usuário
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json(JSON.parse(JSON.stringify({
      message: 'E-mail e senha são obrigatórios'
    }, getCircularReplacer())));
  }

  // Query para buscar o usuário pelo e-mail
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json(JSON.parse(JSON.stringify({
        message: 'Erro ao buscar usuário'
      }, getCircularReplacer())));
    }

    if (results.length === 0) {
      return res.status(404).json(JSON.parse(JSON.stringify({
        message: 'Usuário não encontrado'
      }, getCircularReplacer())));
    }

    const userData = results[0];

    // Comparação simples da senha
    if (senha !== userData.senha) {
      return res.status(401).json(JSON.parse(JSON.stringify({
        message: 'Senha incorreta'
      }, getCircularReplacer())));
    }

    // Gerar o token JWT
    const token = generateToken(userData);

    // Retornar o token e dados do usuário
    res.status(200).json(JSON.parse(JSON.stringify({
      message: 'Login bem-sucedido',
      token,
      userId: userData.id,  // ID do usuário
      userName: userData.nome,   // Nome do usuário
      userEmail: userData.email, // E-mail do usuário
    }, getCircularReplacer())));
  });
});

// Função de middleware para verificar o token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
  
  if (!token) return res.status(403).send('Acesso negado');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Token inválido');
    req.user = user;
    next();
  });
}

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
