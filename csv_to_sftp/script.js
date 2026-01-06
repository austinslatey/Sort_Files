require('dotenv').config();

const http = require('http');
const fs = require('fs');
const csv = require('csv-parser');
const Client = require('ssh2-sftp-client');

// === CONFIGURAÇÕES DO .env ===
const url = process.env.INVENTORY_URL;                    // ex: http://inventory.waldoch.com/exports/export_nosold.php
const WALDOCH_ZIP = process.env.WALDOCH_ZIP || '55025';   // pode mudar no .env se precisar

const outputCsv = 'WaldochWorkTruckSolutions.csv';
const remotePath = '/web/wp-content/plugins/WaldochFormsAPI/js/testdrop/WaldochWorkTruckSolutions.csv';

// === ESCOLHA O AMBIENTE ===
// Mude para 'TESTE' quando estiver tudo testado e aprovado
const AMBIENTE = 'PROD';

let sftpConfig;

if (AMBIENTE === 'TESTE') {
    sftpConfig = {
        host: process.env.TEST_SFTP_HOST,
        port: Number(process.env.TEST_SFTP_PORT) || 22,
        username: process.env.TEST_SFTP_USERNAME,
        privateKey: fs.readFileSync(process.env.TEST_SFTP_PRIVATE_KEY_PATH),
        passphrase: process.env.TEST_SFTP_PASSPHRASE,  // ← sem || undefined
    };
    console.log(`[${new Date().toISOString()}] Configurado para SFTP de TESTE (chave SSH)`);
} else if (AMBIENTE === 'PROD') {
    sftpConfig = {
        host: process.env.PROD_SFTP_HOST,
        port: Number(process.env.PROD_SFTP_PORT) || 22,
        username: process.env.PROD_SFTP_USERNAME,
        password: process.env.PROD_SFTP_PASSWORD,
    };
    console.log(`[${new Date().toISOString()}] Configurado para SFTP de PRODUÇÃO (senha)`);
} else {
    console.error('Erro: AMBIENTE inválido. Use "TESTE" ou "PROD"');
    process.exit(1);
}

// === PROCESSAMENTO ===
const cleanVehicles = [];
let currentMake = null;
let fieldMapping = null;

if (!url) {
    console.error('Erro: INVENTORY_URL não está definido no .env');
    process.exit(1);
}

console.log(`[${new Date().toISOString()}] Iniciando fetch dos dados...`);

http.get(url, (response) => {
    if (response.statusCode !== 200) {
        console.error(`Falha ao buscar dados: ${response.statusCode} ${response.statusMessage}`);
        response.resume();
        process.exit(1);
    }

    response
        .pipe(csv())
        .on('data', (row) => {
            const timestampKey = Object.keys(row).find(k => k.startsWith('Exported:'));

            if (!timestampKey) return;

            // Detecta título da seção (ex: "Chevy vehicles")
            if (row[timestampKey]?.includes(' vehicles')) {
                currentMake = row[timestampKey].replace(' vehicles', '').trim().toUpperCase();
                return;
            }

            // Detecta linha de cabeçalho
            if (row['_1'] === 'build' && row[timestampKey] === 'date_added') {
                fieldMapping = {
                    [timestampKey]: 'date_added',
                    '_1': 'build',
                    '_2': 'year',
                    '_3': 'body',
                    '_4': 'make',
                    '_5': 'model',
                    '_6': 'trim',
                    '_7': 'package',
                    '_8': 'cab_roof',
                    '_9': 'box_wheelbase',
                    '_10': 'engine',
                    '_11': 'exterior',
                    '_12': 'interior_material',
                    '_13': 'order_num',
                    '_14': 'vin',
                    '_18': 'receipt'
                };
                return;
            }

            // Processa linha de veículo
            if (fieldMapping && currentMake && row['_4']?.trim().toUpperCase() === currentMake) {
                const vehicle = {};
                Object.keys(fieldMapping).forEach(oldKey => {
                    const value = row[oldKey];
                    if (value !== undefined && value !== '' && value !== null) {
                        vehicle[fieldMapping[oldKey]] = value.trim();
                    }
                });

                if (vehicle.order_num) {
                    vehicle.stock_number = vehicle.order_num;
                    delete vehicle.order_num;
                }

                const hasReceipt = vehicle.receipt?.trim() !== '';
                vehicle['Location Name'] = hasReceipt ? 'Waldoch' : '';
                vehicle['Location Zip Code'] = hasReceipt ? WALDOCH_ZIP : '';

                cleanVehicles.push(vehicle);
            }
        })
        .on('end', async () => {
            // Gera o CSV
            const headers = [
                'date_added', 'build', 'year', 'body', 'make', 'model', 'trim',
                'package', 'cab_roof', 'box_wheelbase', 'engine', 'exterior',
                'interior_material', 'stock_number', 'vin', 'Location Name', 'Location Zip Code'
            ];

            function escapeCSV(val) {
                if (val === undefined || val === null || val === '') return '';
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            }

            let csvContent = headers.join(',') + '\n';
            cleanVehicles.forEach(v => {
                const row = headers.map(h => escapeCSV(v[h]));
                csvContent += row.join(',') + '\n';
            });

            fs.writeFileSync(outputCsv, csvContent, 'utf8');
            console.log(`CSV gerado: ${outputCsv} (${cleanVehicles.length} veículos)`);

            // === UPLOAD SFTP ===
            const sftp = new Client();
            try {
                console.log('Conectando ao SFTP...');
                await sftp.connect(sftpConfig);
                console.log(`Enviando ${outputCsv} → ${remotePath}`);
                await sftp.put(outputCsv, remotePath);
                console.log(`[${new Date().toISOString()}] Upload concluído com sucesso no servidor ${AMBIENTE}!`);
            } catch (err) {
                console.error('Erro no SFTP:', err.message);
                process.exit(1);
            } finally {
                sftp.end();
            }
        })
        .on('error', (err) => {
            console.error('Erro ao processar CSV:', err.message);
            process.exit(1);
        });
})
    .on('error', (err) => {
        console.error('Erro na requisição HTTP:', err.message);
        process.exit(1);
    });