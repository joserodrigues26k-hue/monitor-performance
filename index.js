const puppeteer = require('puppeteer'); // Importa a biblioteca Puppeteer para controle do navegador
const fs = require('fs'); // Define as URLs a serem monitoradas, com seus respectivos nomes, textos de exibição e limites de tempo em milissegundos

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
    const page = await browser.newPage(); // Abre uma nova página no navegador para cada monitoramento
    const inicio =  Date.now(); // Registra o tempo de início do monitoramento;

    try {
        await page.goto(item.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
        }); // Navega para a URL e espera até que a rede esteja ociosa

        const tempoCarregamento = Date.now() - inicio; // Calcula o tempo de carregamento
        const conteudo = await page.content(); // Obtém o conteúdo da página
        const localizaTexto = conteudo.includes(item.WaitingText); // Verifica se o texto esperado está presente no conteúdo da página
        const status = tempoCarregamento <= item.limiteMs && localizaTexto ? 'OK' : 'ALERTA'; // Determina o status com base no tempo de carregamento e na presença do texto
        const resultado = {
            nome: item.nome,
            url: item.url,
            tempoCarregamento,
            status
        }; // Cria um objeto com os resultados do monitoramento

        if (status === 'ALERTA') {
            console.table([resultado]);
        }else{
            console.table([resultado]);
        }
        
        

        await page.close(); // Fecha a página após o monitoramento
        return resultado; // Retorna o resultado do monitoramento
    } catch (error) {
        console.error(`Erro ao monitorar ${item.nome}:`, error);
        await page.close(); // Fecha a página em caso de erro
        throw error; // Re-lança o erro para ser tratado pelo chamador
    }           
}

async function executarMonitoramento() {
    const browser = await puppeteer.launch({
      headless: true
    }); // Inicia o navegador em modo headless (sem interface gráfica)

    const resultados = [];

    for (const item of urls) {
        const resultado = await monitorarPerformance(item, browser);
        resultados.push(resultado);
    }

    await browser.close(); // Fecha o navegador após o monitoramento
    fs.writeFileSync('resultados.json', JSON.stringify(resultados, null, 2)); // Salva os resultados em um arquivo JSON
    console.log('Monitoramento concluído. Resultados salvos em resultados.json');
}

executarMonitoramento();
