const puppeteer = require('puppeteer');
const fs = require('fs'); 

const urls = [
    {
        nome: 'clients',
        url: 'http://127.0.0.1:3000/clientes',
        WaitingText: 'Exibindo os Clientes',
        limiteMs: 5000
    },
    {
        nome: 'dashboard',
        url: 'http://127.0.0.1:3000/dashboard',
        WaitingText: 'Exibindo a Dashboard',
        limiteMs: 3000
    },
    {
        nome: 'user',
        url: 'http://127.0.0.1:3000/user',
        WaitingText: 'Exibindo o user',
        limiteMs: 3000
    }
];

async function monitorarPerformance(item, browser) {
    const page = await browser.newPage(); 
    const inicio =  Date.now();
    try {
        await page.goto(item.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
        });

        const tempoCarregamento = Date.now() - inicio; 
        const conteudo = await page.content(); 
        const localizaTexto = conteudo.includes(item.WaitingText); 
        const status = tempoCarregamento <= item.limiteMs && localizaTexto ? 'OK' : 'ALERTA'; 
        const resultado = {
            nome: item.nome,
            url: item.url,
            tempoCarregamento,
            status
        }; 

        if (status === 'ALERTA') {
            console.table([resultado]);
        }else{
            console.table([resultado]);
        }
        
        

        await page.close(); 
        return resultado; 
    } catch (error) {
        console.error(`Erro ao monitorar ${item.nome}:`, error);
        await page.close(); 
        throw error; 
    }           
}

async function executarMonitoramento() {
    const browser = await puppeteer.launch({
      headless: true
    });
    const resultados = [];

    for (const item of urls) {
        const resultado = await monitorarPerformance(item, browser);
        resultados.push(resultado);
    }

    await browser.close();
    fs.writeFileSync('resultados.json', JSON.stringify(resultados, null, 2)); 
    console.log('Monitoramento concluído. Resultados salvos em resultados.json');
}

executarMonitoramento();
