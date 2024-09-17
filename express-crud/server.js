const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;
const cors = require('cors');


app.use(cors({
  origin: 'http://localhost:3001', // Permite requisições do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type'], // Cabeçalhos permitidos
}));
app.use(bodyParser.json());

// Configurar banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'crud',
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Criar tabela Users
db.query(
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(20),
    data_nascimento DATE
  )`,
  err => {
    if (err) {
      console.error('Error creating table:', err.message);
      return;
    }
    console.log('Table "cadastros" created or already exists');
  }
);


// Listar todos os usuários
app.get('/cadastros', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(results);
  });
});

// Buscar um usuário pelo ID
app.get('/cadastros/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (result.length === 0) {
      res.status(404).send('User not found');
      return;
    }
    res.json(result[0]);
  });
});

// Criar um novo usuário
app.post('/cadastros', (req, res) => {
  const { name, email, telefone, data_nascimento } = req.body;
  db.query(
    'INSERT INTO users (name, email, telefone, data_nascimento) VALUES (?, ?, ?, ?)',
    [name, email, telefone, data_nascimento],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.status(201).json({ id: result.insertId });
    }
  );
});

// Atualizar um usuário existente
app.put('/cadastros/:id', (req, res) => {
  const id = req.params.id;
  const { name, email, telefone, data_nascimento } = req.body;
  db.query(
    'UPDATE users SET name = ?, email = ?, telefone = ?, data_nascimento = ? WHERE id = ?',
    [name, email, telefone, data_nascimento, id],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('User not found');
        return;
      }
      res.sendStatus(204);
    }
  );
});

// Deletar um usuário
app.delete('/cadastros/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('User not found');
      return;
    }
    res.sendStatus(204);
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
