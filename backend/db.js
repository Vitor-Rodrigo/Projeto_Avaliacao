// backend/db.js (Usando mysql2 para compatibilidade)

const mysql = require('mysql2'); 

// Configurações de conexão (usando seus dados)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '1234', // ⚠️ SUBSTITUA PELA SUA SENHA REAL
  database: 'sistema_produtos', 
  port: 3306,
  // Opção essencial para compatibilidade com o MySQL 8+ (caching_sha2_password)
  authPlugins: { 
    mysql_native_password: () => () => require('mysql2/lib/auth_plugins/mysql_native_password')
  }
});

// Tentativa de conexão
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados MySQL: ' + err.stack);
    process.exit(1); 
  }
  console.log('Conectado ao MySQL com sucesso (ID: ' + connection.threadId + ')');
});

// Exporta a conexão
module.exports = connection;