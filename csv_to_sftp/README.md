# CSV_TO_SFTP
1. Sends a GET request to fetch data from URL(data endpoint)
2. Creates a custom CSV from data 
3. Sends the file to a server via SFTP every 24 hours via Windows `Task Scheduler`

## To Automate using `Task Scheduler`
User must create a .bat file or similar to execute code automatically
```
@echo off
cd "C:\Users\path\to\code"
"C:\Program Files\nodejs\node.exe" script.js >> upload.log 2>&1
```

## .env Example
The test server uses a private key connection, the production server does not require a private key.

```env.EXAMPLE
# Servidor de Teste (usa chave SSH)
TEST_SFTP_HOST=sftp-teste.seudominio.com
TEST_SFTP_PORT=22
TEST_SFTP_USERNAME=seu_usuario_teste
TEST_SFTP_PRIVATE_KEY_PATH=/caminho/para/sua/chave_privada_teste.pem
# TEST_SFTP_PASSPHRASE=sua_senha_da_chave  # só se a chave tiver senha (passphrase)

# Servidor de Produção (usa senha)
PROD_SFTP_HOST=sftp.producao.seudominio.com
PROD_SFTP_PORT=22
PROD_SFTP_USERNAME=seu_usuario_producao
PROD_SFTP_PASSWORD=sua_senha_producao
```