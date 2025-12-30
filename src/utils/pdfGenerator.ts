import type { RelatorioDadosDTO } from '@/types/report.types';
import { formatCurrency } from './formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para gerar HTML do relatório
export function gerarHTMLRelatorio(dados: RelatorioDadosDTO): string {
    // Sempre usa a data atual da máquina no momento da geração do PDF
    // Ignora dados.dataGeracao que vem do backend
    const dataGeracaoMaquina = new Date();
    const dataFormatada = format(dataGeracaoMaquina, "dd/MM/yyyy", { locale: ptBR });

    // Tabela de movimentações - gerar de forma dinâmica, usando dados.
    const movimentacoesHTML = dados.movimentacoes.map(mov => {
        const dataMov = format(new Date(mov.dataMovimentacao), "dd/MM/yyyy", { locale: ptBR });
        const tipoClass = mov.tipoMovimentacao === 'RECEITA' ? 'type-receita' : 'type-despesa';
        const valorFormatado = formatCurrency(typeof mov.valor === 'number' ? mov.valor : Number(mov.valor));
        const saldoFormatado = mov.saldoAtual ? formatCurrency(typeof mov.saldoAtual === 'number' ? mov.saldoAtual : Number(mov.saldoAtual)) : '-';
        return `
      <tr>
        <td>${dataMov}</td>
        <td class="${tipoClass}">${mov.tipoMovimentacao}</td>
        <td>${mov.categoria}</td>
        <td>${mov.descricao}</td>
        <td style="text-align:right">${valorFormatado}</td>
        <td><span class="status">${mov.status}</span></td>
        <td style="text-align:right">${saldoFormatado}</td>
      </tr>
    `;
    }).join('');

    // Resumo financeiro
    const totalReceitas = formatCurrency(typeof dados.totalReceitas === 'number' ? dados.totalReceitas : Number(dados.totalReceitas));
    const totalDespesas = formatCurrency(typeof dados.totalDespesas === 'number' ? dados.totalDespesas : Number(dados.totalDespesas));
    const saldoLiquido = formatCurrency(typeof dados.saldoLiquido === 'number' ? dados.saldoLiquido : Number(dados.saldoLiquido));
    const saldoAtual = formatCurrency(typeof dados.saldoAtual === 'number' ? dados.saldoAtual : Number(dados.saldoAtual));

    // Montagem do HTML, igual ao modelo fornecido, mas os valores são dinâmicos.
    // Fontes reduzidas em 20% (ex: 18px -> 14.4px, 15px -> 12px, 14px -> 11.2px, 13px -> 10.4px, 16px -> 12.8px, 12px -> 9.6px)
    // Para CSS inline, use pixel para arredondado próximo.
    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Relatório Financeiro</title>
  <style>
    :root{
      --bg:#f6f8fa;
      --card:#ffffff;
      --accent:#0b7285;
      --muted:#667085;
      --success:#0f5132;
      --danger:#8b1e3f;
      --glass: rgba(11,114,133,0.06);
      --radius:12px;
      font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color-scheme: light;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      background:#ffffff;
      padding:20px;
      font-size:11.2px; /* diminuiu 20% de 14px base */
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
    }
    .container{
      max-width:800px;
      margin:0 auto;
    }
    header.card{
      background:var(--card);
      border-radius:var(--radius);
      padding:16px 19.2px; /* 20px/24px * 0.8 */
      box-shadow:none;
      display:flex;
      gap:16px;
      align-items:center;
      margin-bottom:14.4px;
    }
    .brand{
      width:59px;height:59px;border-radius:8px;
      background:linear-gradient(135deg,var(--accent),#0ea5a5);
      display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14.4px;
      flex:0 0 59px;
    }
    .meta{flex:1}
    .meta h1{margin:0;font-size:14.4px}
    .meta p{margin:4.8px 0 0;color:var(--muted);font-size:10.4px}

    .grid{
      display:grid;grid-template-columns:1fr 256px;gap:14.4px;align-items:start;
    }

    .card{background:var(--card);border-radius:var(--radius);padding:14.4px;box-shadow:none;}

    table{width:100%;border-collapse:collapse;font-size:11.2px}
    thead th{ text-align:left;padding:9.6px 8px;font-weight:600;color:#0b1720;background:transparent;border-bottom:1px solid #eef2f6}
    tbody td{padding:9.6px 8px;border-bottom:1px solid #f2f5f8;color:#12263a}
    tbody tr:last-child td{border-bottom:none}

    .type-receita{color:var(--success);font-weight:600}
    .type-despesa{color:var(--danger);font-weight:600}

    .status{display:inline-block;padding:4.8px 6.4px;border-radius:999px;font-size:9.6px;background:var(--glass);color:var(--muted)}

    .summary{display:flex;flex-direction:column;gap:8px}
    .summary .item{display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:8px}
    .summary .total{font-size:12.8px;font-weight:700}
    .summary .badge{font-size:11.2px;color:var(--muted)}

    .positive{color:var(--success)}
    .negative{color:var(--danger)}

    footer{margin-top:11.2px;text-align:right;color:var(--muted);font-size:10.4px}

    /* Responsive */
    @media (max-width:880px){
      .grid{grid-template-columns:1fr}
      header.card{flex-direction:row}
    }

    /* Print-friendly */
    @media print{
      @page { size: A4 portrait; margin: 20mm; }
      body { padding:0; background:white; }
      .container { max-width:100%; margin:0; }
      .grid { grid-template-columns:1fr; }
      header.card, .card { border-radius:0; box-shadow:none; page-break-inside:avoid; }
      table { font-size:9px; }
      tbody td, thead th { padding:4.8px 4.8px; }
    }

    header.card, .card{box-shadow:none;border-radius:0}
    .grid{grid-template-columns:1fr}
  </style>
</head>
<body>
  <div class="container">
    <header class="card" role="banner">
      <div class="meta">
        <h1>Relatório Financeiro</h1>
        <p>Conta: <strong>${dados.conta.banco}</strong> • Ag: <strong>${dados.conta.numeroAgencia}</strong> • Conta: <strong>${dados.conta.numeroConta}</strong></p>
        <p>Responsável: <strong>${dados.conta.responsavel}</strong></p>
      </div>
      <div style="text-align:right">
        <div style="font-size:9.6px;color:var(--muted)">Relatório gerado em</div>
        <div style="font-weight:700">${dataFormatada}</div>
      </div>
    </header>

    <main class="grid">
      <section class="card" aria-labelledby="mov-title">
        <h2 id="mov-title" style="margin:0 0 9.6px 0;font-size:12px">Movimentações</h2>

        <table role="table" aria-label="Tabela de movimentações">
          <caption style="text-align:left;padding:6.4px 0 9.6px 0;color:var(--muted)">Transações ordenadas (data, tipo, categoria, descrição, valor, status, saldo)</caption>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th style="text-align:right">Valor</th>
              <th>Status</th>
              <th style="text-align:right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${movimentacoesHTML}
          </tbody>
        </table>

        <footer>Dados apresentados conforme registro fornecido.</footer>
      </section>

      <aside class="card" aria-labelledby="resumo-title">
        <h3 id="resumo-title" style="margin:0 0 8px 0;font-size:12px">Resumo Financeiro</h3>
        <div class="summary">
          <div class="item" style="background:linear-gradient(180deg,#f7fffd,white);">
            <div class="badge">Total de Receitas</div>
            <div class="total positive">${totalReceitas}</div>
          </div>

          <div class="item" style="background:linear-gradient(180deg,#fff7f8,white);">
            <div class="badge">Total de Despesas</div>
            <div class="total negative">${totalDespesas}</div>
          </div>

          <div class="item" style="background:linear-gradient(180deg,#f7f9ff,white);">
            <div class="badge">Saldo Líquido</div>
            <div class="total">${saldoLiquido}</div>
          </div>

          <div class="item" style="background:transparent;">
            <div class="badge">Saldo Atual da Conta</div>
            <div class="total">${saldoAtual}</div>
          </div>
        </div>

        <div style="margin-top:11.2px;color:var(--muted);font-size:10.4px">Status das transações: apenas entradas marcadas como "CONCLUIDA" foram consideradas no cálculo.</div>
      </aside>
    </main>

    <footer style="margin-top:40px;padding-top:20px;border-top:1px solid #eef2f6">
      <div style="display:flex;justify-content:space-around;gap:20px;margin-top:30px">
        <div style="flex:1;text-align:center">
          <div style="border-top:1px solid #667085;padding-top:4px;margin-top:50px;width:200px;margin-left:auto;margin-right:auto"></div>
          <div style="margin-top:8px;font-size:10.4px;color:var(--muted)">Assinatura 1</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="border-top:1px solid #667085;padding-top:4px;margin-top:50px;width:200px;margin-left:auto;margin-right:auto"></div>
          <div style="margin-top:8px;font-size:10.4px;color:var(--muted)">Assinatura 2</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="border-top:1px solid #667085;padding-top:4px;margin-top:50px;width:200px;margin-left:auto;margin-right:auto"></div>
          <div style="margin-top:8px;font-size:10.4px;color:var(--muted)">Assinatura 3</div>
        </div>
      </div>
    </footer>

  </div>
</body>
</html>
  `;
}

// Função para gerar e baixar o PDF
export async function gerarPDF(dados: RelatorioDadosDTO): Promise<void> {
    // Usando html2pdf.js via CDN dinamicamente
    return new Promise((resolve, reject) => {
        // Verifica se html2pdf já está carregado
        if ((window as any).html2pdf) {
            gerarPDFComHtml2Pdf(dados, resolve, reject);
        } else {
            // Carrega html2pdf.js dinamicamente
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
                gerarPDFComHtml2Pdf(dados, resolve, reject);
            };
            script.onerror = () => {
                reject(new Error('Erro ao carregar biblioteca html2pdf.js'));
            };
            document.head.appendChild(script);
        }
    });
}

function gerarPDFComHtml2Pdf(
    dados: RelatorioDadosDTO,
    resolve: () => void,
    reject: (error: Error) => void
) {
    try {
        const html = gerarHTMLRelatorio(dados);

        // Cria um elemento temporário para renderizar o HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        const element = tempDiv.querySelector('.container') as HTMLElement;

        if (!element) {
            throw new Error('Elemento não encontrado');
        }

        const opt = {
            margin: 0.5,
            filename: `relatorio_movimentacoes_${dados.conta.banco}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        (window as any).html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                document.body.removeChild(tempDiv);
                resolve();
            })
            .catch((error: Error) => {
                document.body.removeChild(tempDiv);
                reject(error);
            });
    } catch (error) {
        reject(error as Error);
    }
}
