const API = 'https://api.frankfurter.app';

const currencies = [
  { code: 'EUR', name: 'Euro', flag: 'eu' },
  { code: 'USD', name: 'Dólar Americano', flag: 'us' },
  { code: 'GBP', name: 'Libra', flag: 'gb' },
  { code: 'BRL', name: 'Real', flag: 'br' },
  { code: 'JPY', name: 'Iene', flag: 'jp' },
  { code: 'AUD', name: 'Dólar Australiano', flag: 'au' },
  { code: 'CAD', name: 'Dólar Canadiano', flag: 'ca' },
  { code: 'CHF', name: 'Franco Suíço', flag: 'ch' },
  { code: 'CNY', name: 'Yuan', flag: 'cn' },
  { code: 'SEK', name: 'Coroa Sueca', flag: 'se' }
];

const flagURL = code => `https://flagcdn.com/24x18/${code}.png`;

function createDropdown(containerId, defaultCode, onSelect) {
  const container = document.getElementById(containerId);
  container.classList.add('custom-dropdown');

  /* topo (moeda seleccionada) */
  const selected = document.createElement('div');
  selected.classList.add('selected');
  container.appendChild(selected);

  /* lista */
  const list = document.createElement('ul');
  list.classList.add('dropdown-list');
  container.appendChild(list);

  /* 🔍 campo de pesquisa */
  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'dropdown-search';
  search.placeholder = 'Procurar moeda…';
  list.appendChild(search);

  /* gera itens */
  currencies.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<img src="${flagURL(c.flag)}" width="24" height="18"> ${c.code}`;
    li.dataset.code = c.code;
    li.dataset.name = c.name.toLowerCase(); // para pesquisa
    list.appendChild(li);
  });

  /* selecciona item */
  const selectItem = (code) => {
    container.querySelectorAll('li').forEach(el => el.classList.remove('selected-option'));
    const li = [...container.querySelectorAll('li')].find(l => l.dataset.code === code);
    if (li) li.classList.add('selected-option');

    const { flag } = currencies.find(c => c.code === code);
    selected.innerHTML = `<img src="${flagURL(flag)}" width="24" height="18"> ${code}`;
    list.classList.remove('show');
    container.classList.remove('open');
    onSelect(code);
  };

  /* click em item */
  list.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (li && li.dataset.code) selectItem(li.dataset.code);
  });

  /* pesquisa dinâmica */
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    container.querySelectorAll('li').forEach(li => {
      li.style.display = (li.dataset.code.toLowerCase().includes(q) || li.dataset.name.includes(q)) ? '' : 'none';
    });
  });

  /* abre/fecha dropdown */
  selected.addEventListener('click', () => {
    container.classList.toggle('open');
    search.value = '';
    search.dispatchEvent(new Event('input'));
    if (container.classList.contains('open')) search.focus();
  });
  window.addEventListener('click', e => {
    if (!container.contains(e.target)) container.classList.remove('open');
  });

  /* estado inicial */
  selectItem(defaultCode);
}


let fromCurrency = 'EUR';
let toCurrency = 'USD';

const amountInput = document.getElementById('amount');
const resultDisplay = document.getElementById('result');
const rateInfo = document.getElementById('rate-info');
const swapBtn = document.getElementById('swap');
const periodSelect = document.getElementById('period');
periodSelect.addEventListener('change', () => {
  periodDays = parseInt(periodSelect.value, 10);
  updateChart();
});
let firstConversionDone = false;
let chart; // guarda a instância Chart.js
let periodDays = 30;           // valor inicial = 30 dias



function updateConversion() {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    resultDisplay.textContent = '';
    rateInfo.textContent = '';
    return;
  }

  if (fromCurrency === toCurrency) {
    resultDisplay.textContent = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
    rateInfo.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
    updateChart();
    return;
  }

  fetch(`${API}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`)
    .then(res => res.json())
    .then(data => {
      const rate = data.rates[toCurrency];
      resultDisplay.textContent = `${amount} ${fromCurrency} = ${rate} ${toCurrency}`;
      rateInfo.textContent = `1 ${fromCurrency} = ${(rate / amount).toFixed(4)} ${toCurrency}`;
      
      resultDisplay.style.display = 'block';
      rateInfo.style.display = 'block';
      
      resultDisplay.classList.add('fade-in-smooth');
      rateInfo.classList.add('fade-in-smooth');

      updateChart();

      if (!firstConversionDone) {
        const convertBtn = document.getElementById('convert-btn');
        convertBtn.classList.add('fade-out');
        setTimeout(() => {
          convertBtn.style.display = 'none';
        }, 400);
        firstConversionDone = true;

        // Ativar eventos após a primeira conversão
        amountInput.addEventListener('input', updateConversion);
        swapBtn.addEventListener('click', () => {
          [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
          document.querySelector('#from-dropdown .selected').innerHTML = document.querySelector('#to-dropdown .selected').innerHTML;
          document.querySelector('#to-dropdown .selected').innerHTML = `<img src="${flagURL(currencies.find(c => c.code === fromCurrency).flag)}" width="24" height="18"> ${fromCurrency}`;
          updateConversion();
        });
      }
    }).catch(err => {
      resultDisplay.textContent = '';
      rateInfo.textContent = 'Erro ao obter taxa.';
      console.error(err);
    });
}


createDropdown('from-dropdown', 'EUR', code => {
  fromCurrency = code;
  if (firstConversionDone) updateConversion();
});
createDropdown('to-dropdown', 'USD', code => {
  toCurrency = code;
  if (firstConversionDone) updateConversion();
});

// Navegação entre páginas
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.dataset.page;
  
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
  
      document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
      });
      document.getElementById(`page-${target}`).classList.remove('hidden');
      document.getElementById(`page-${target}`).classList.add('active');
      if (target === 'history') {
        renderHistory(); // mostrar os dados do localStorage
      }      
    });
  });
  
  // Guardar histórico localStorage
  function saveHistory(entry) {
    const history = JSON.parse(localStorage.getItem('currency-history')) || [];
    history.unshift(entry);
    localStorage.setItem('currency-history', JSON.stringify(history));
    renderHistory();
  }
  function renderHistory() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('currency-history')) || [];
    historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
  }
  
  function updateChart() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - periodDays);
  
    const format = d => d.toISOString().split('T')[0];
    const url = `${API}/${format(start)}..${format(end)}?from=${fromCurrency}&to=${toCurrency}`;
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const labels = Object.keys(data.rates).sort();
        const values = labels.map(date => data.rates[date][toCurrency]);
  
        // cria ou actualiza
        if (!chart) {
          const ctx = document.getElementById('evolution-chart').getContext('2d');
          chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{
                label: `${fromCurrency} → ${toCurrency}`,
                data: values,
                fill: false,
                borderColor: '#10b981',
                tension: 0.3,
                pointRadius: 0
              }]
            },
            options: {
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { labels: { color: '#f3f4f6' } },
                tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(4) } }
              },
              scales: {
                x: { ticks: { color: '#cbd5e1' } },
                y: { ticks: { color: '#cbd5e1' } }
              }
            }
          });
        } else {
          chart.data.labels = labels;
          chart.data.datasets[0].data = values;
          chart.data.datasets[0].label = `${fromCurrency} → ${toCurrency}`;
          chart.update();
        }
      })
      .catch(err => console.error('Erro no gráfico', err));
  }

  
  // Chama isto quando fizeres uma conversão
  function updateConversionAndSave() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      resultDisplay.textContent = '';
      rateInfo.textContent = '';
      return;
    }
  
    if (fromCurrency === toCurrency) {
      resultDisplay.textContent = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
      rateInfo.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
      resultDisplay.style.display = 'block';
      rateInfo.style.display = 'block';
      resultDisplay.classList.add('fade-in-smooth');
      rateInfo.classList.add('fade-in-smooth');
      saveHistory(`${amount} ${fromCurrency} ➜ ${amount} ${toCurrency}`);
      updateChart();
      return;
    }
  
    fetch(`${API}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`)
      .then(res => res.json())
      .then(data => {
        const rate = data.rates[toCurrency];
        resultDisplay.textContent = `${amount} ${fromCurrency} = ${rate} ${toCurrency}`;
        rateInfo.textContent = `1 ${fromCurrency} = ${(rate / amount).toFixed(4)} ${toCurrency}`;
  
        resultDisplay.style.display = 'block';
        rateInfo.style.display = 'block';
  
        resultDisplay.classList.add('fade-in-smooth');
        rateInfo.classList.add('fade-in-smooth');
  
        saveHistory(`${amount} ${fromCurrency} ➜ ${rate} ${toCurrency}`);
        updateChart(); 
      }).catch(err => {
        resultDisplay.textContent = '';
        rateInfo.textContent = 'Erro ao obter taxa.';
        console.error(err);
      });
  }
  

  document.getElementById('convert-btn').addEventListener('click', () => {
    updateConversionAndSave();
  });  

  function scrollToConverter() {
    document.getElementById('page-converter')
      .scrollIntoView({ behavior: 'smooth' });
  }

  document.addEventListener("DOMContentLoaded", () => {
    new Typed("#typed-text", {
      strings: ["Xcoin", "A sua moeda, o seu futuro", "Conversões em tempo real"],
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1500,
      loop: true
    });
  });

  window.addEventListener('load', () => {
    const spline = document.querySelector('.spline-wrapper');
    if (spline) {
      spline.classList.add('visible');
    }
  });
  
  
  
  
  
  
