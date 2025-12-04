    // backend/server.js

    const express = require('express');
    const cors = require('cors');
    const app = express();
    const port = 3000;

    // ------------------------------------
    // 1. IMPORTAÇÕES E CONFIGURAÇÃO DO SWAGGER
    // ------------------------------------
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./swagger'); 

    // Importe a sua conexão MySQL.
    const connection = require('./db'); 

    // ------------------------------------
    // 2. MIDDLEWARE
    // ------------------------------------

    // Configuração do CORS
    app.use(cors({
        origin: 'http://localhost:5173', 
        methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    }));

    // Middleware para ler JSON
    app.use(express.json());

    // INTEGRAÇÃO DO SWAGGER: Adiciona a rota /api-docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));


    // ------------------------------------
    // 3. ROTAS CRUD DE PRODUTOS (Com Documentação Swagger)
    // ------------------------------------

    // [R] READ / LISTAR TODOS (GET /produtos)
    /**
     * @swagger
     * /produtos:
     * get:
     * summary: Retorna a lista completa de produtos cadastrados.
     * tags: [Produtos]
     * responses:
     * 200:
     * description: Lista de produtos obtida com sucesso.
     * content:
     * application/json:
     * schema:
     * type: array
     * items:
     * type: object
     * properties:
     * id:
     * type: integer
     * example: 1
     * nome:
     * type: string
     * example: Computador Gamer
     * preco:
     * type: number
     * format: float
     * example: 5500.00
     * descricao:
     * type: string
     * example: PC de alta performance.
     * 500:
     * description: Erro ao buscar produtos no banco de dados.
     */
    app.get('/produtos', (req, res) => {
        const query = 'SELECT * FROM produtos ORDER BY id DESC'; 
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar produtos:', err);
                return res.status(500).json({ message: 'Erro ao buscar produtos.' }); 
            }
            res.status(200).json(results);
        });
    });

    // [C] CREATE / CRIAR (POST /produtos)
    /**
     * @swagger
     * /produtos:
     * post:
     * summary: Cria um novo produto no banco de dados.
     * tags: [Produtos]
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * required:
     * - nome
     * - preco
     * properties:
     * nome:
     * type: string
     * example: Mousepad Grande
     * preco:
     * type: number
     * format: float
     * example: 89.90
     * descricao:
     * type: string
     * example: Mousepad com borda costurada e LED.
     * responses:
     * 201:
     * description: Produto criado com sucesso, retornando o ID gerado.
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * id:
     * type: integer
     * example: 5
     * nome:
     * type: string
     * preco:
     * type: number
     * descricao:
     * type: string
     * 500:
     * description: Erro ao criar produto no banco de dados.
     */
    app.post('/produtos', (req, res) => {
        const { nome, preco, descricao } = req.body;
        const query = 'INSERT INTO produtos (nome, preco, descricao) VALUES (?, ?, ?)';
        
        connection.query(query, [nome, preco, descricao], (err, result) => {
            if (err) {
                console.error('Erro ao criar produto:', err);
                return res.status(500).json({ message: 'Erro ao criar produto.' });
            }
            
            res.status(201).json({ 
                id: result.insertId, 
                nome, 
                preco, 
                descricao 
            });
        });
    });

    // [U] UPDATE / ATUALIZAR (PUT /produtos/:id)
    /**
     * @swagger
     * /produtos/{id}:
     * put:
     * summary: Atualiza um produto existente pelo ID.
     * tags: [Produtos]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: integer
     * description: ID do produto a ser atualizado.
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * nome:
     * type: string
     * example: Novo Headset Premium
     * preco:
     * type: number
     * format: float
     * example: 350.50
     * descricao:
     * type: string
     * example: Headset com cancelamento de ruído.
     * responses:
     * 200:
     * description: Produto atualizado com sucesso.
     * 404:
     * description: Produto não encontrado.
     * 500:
     * description: Erro ao atualizar o produto.
     */
    app.put('/produtos/:id', (req, res) => {
        const { id } = req.params;
        const { nome, preco, descricao } = req.body;
        const query = 'UPDATE produtos SET nome = ?, preco = ?, descricao = ? WHERE id = ?';
        
        connection.query(query, [nome, preco, descricao, id], (err, result) => {
            if (err) {
                console.error('Erro ao atualizar produto:', err);
                return res.status(500).json({ message: 'Erro ao atualizar produto.' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Produto não encontrado.' });
            }
            
            res.status(200).json({ message: 'Produto atualizado com sucesso.' });
        });
    });

    // [D] DELETE / EXCLUIR (DELETE /produtos/:id)
    /**
     * @swagger
     * /produtos/{id}:
     * delete:
     * summary: Exclui um produto pelo ID.
     * tags: [Produtos]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: integer
     * description: ID do produto a ser excluído.
     * responses:
     * 200:
     * description: Produto excluído com sucesso.
     * 404:
     * description: Produto não encontrado.
     * 500:
     * description: Erro ao excluir o produto.
     */
    app.delete('/produtos/:id', (req, res) => {
        const { id } = req.params;
        const query = 'DELETE FROM produtos WHERE id = ?';
        
        connection.query(query, [id], (err, result) => {
            if (err) {
                console.error('Erro ao excluir produto:', err);
                return res.status(500).json({ message: 'Erro ao excluir produto.' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Produto não encontrado.' });
            }
            
            res.status(200).json({ message: 'Produto excluído com sucesso.' });
        });
    });


    // ------------------------------------
    // 4. INÍCIO DO SERVIDOR
    // ------------------------------------
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
        console.log(`Documentação Swagger: http://localhost:${port}/api-docs`); 
    });
