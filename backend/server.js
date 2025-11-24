// backend/server.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// ⚠️ Importe a sua conexão MySQL.
// O nome do arquivo pode ser diferente (ex: './conexao')
const connection = require('./db'); 

// ------------------------------------
// MIDDLEWARE
// ------------------------------------

// 1. Configuração do CORS: Permite que o Frontend (porta 5173) se comunique com o Backend (porta 3000).
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
}));

// 2. Middleware para ler JSON no corpo da requisição (essencial para POST e PUT)
app.use(express.json());


// ------------------------------------
// ROTAS CRUD DE PRODUTOS
// ------------------------------------

// [R] READ / LISTAR TODOS (GET /produtos)
app.get('/produtos', (req, res) => {
    const query = 'SELECT * FROM produtos ORDER BY id DESC'; // Ordena para ver os novos primeiro
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            // Tratamento básico de erro [cite: 43, 79]
            return res.status(500).json({ message: 'Erro ao buscar produtos.' }); 
        }
        res.status(200).json(results);
    });
});

// [C] CREATE / CRIAR (POST /produtos)
app.post('/produtos', (req, res) => {
    // Extrai os campos do corpo da requisição
    const { nome, preco, descricao } = req.body;
    
    // Query de inserção
    const query = 'INSERT INTO produtos (nome, preco, descricao) VALUES (?, ?, ?)';
    
    connection.query(query, [nome, preco, descricao], (err, result) => {
        if (err) {
            console.error('Erro ao criar produto:', err);
            // Tratamento básico de erro [cite: 43, 79]
            return res.status(500).json({ message: 'Erro ao criar produto.' });
        }
        
        // Retorna o novo produto com o ID gerado (status 201: Created)
        res.status(201).json({ 
            id: result.insertId, 
            nome, 
            preco, 
            descricao 
        });
    });
});

// [U] UPDATE / ATUALIZAR (PUT /produtos/:id)
app.put('/produtos/:id', (req, res) => {
    const { id } = req.params; // ID do produto na URL
    const { nome, preco, descricao } = req.body; // Dados para atualização
    
    // Query de atualização
    const query = 'UPDATE produtos SET nome = ?, preco = ?, descricao = ? WHERE id = ?';
    
    connection.query(query, [nome, preco, descricao, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar produto:', err);
            return res.status(500).json({ message: 'Erro ao atualizar produto.' });
        }
        
        // Se 0 linhas afetadas, o produto não existe (status 404) [cite: 43, 79]
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        
        res.status(200).json({ message: 'Produto atualizado com sucesso.' });
    });
});

// [D] DELETE / EXCLUIR (DELETE /produtos/:id)
app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params; // ID do produto na URL
    
    // Query de exclusão
    const query = 'DELETE FROM produtos WHERE id = ?';
    
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir produto:', err);
            return res.status(500).json({ message: 'Erro ao excluir produto.' });
        }
        
        // Se 0 linhas afetadas, o produto não existe (status 404) [cite: 43, 79]
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        
        res.status(200).json({ message: 'Produto excluído com sucesso.' });
    });
});


// ------------------------------------
// INÍCIO DO SERVIDOR
// ------------------------------------
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`API REST pronta em http://localhost:${port}`);
    // Assume que a conexão ao MySQL está sendo feita no db.js ou aqui
});