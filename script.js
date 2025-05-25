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

  const selected = document.createElement('div');
  selected.classList.add('selected');
  container.appendChild(selected);

  const list = document.createElement('ul');
  list.classList.add('dropdown-list');
  container.appendChild(list);

  currencies.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<img src="${flagURL(c.flag)}" width="24" height="18"> ${c.code}`;
    li.dataset.code = c.code;
    li.addEventListener('click', () => {
      // Atualiza visual
      container.querySelectorAll('li').forEach(el => el.classList.remove('selected-option'));
      li.classList.add('selected-option');
    
      // Atualiza texto no topo
      selected.innerHTML = `<img src="${flagURL(c.flag)}" width="24" height="18"> ${c.code}`;
      list.classList.remove('show');
      container.classList.remove('open');
      onSelect(c.code);
    });   
    list.appendChild(li);
  });

  selected.addEventListener('click', () => {
    container.classList.toggle('open');
  });

  // Set default
  const c = currencies.find(x => x.code === defaultCode);
  selected.innerHTML = `<img src="${flagURL(c.flag)}" width="24" height="18"> ${c.code}`;
  onSelect(defaultCode);

  // Close if click outside
  window.addEventListener('click', e => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  });
}

let fromCurrency = 'EUR';
let toCurrency = 'USD';

const amountInput = document.getElementById('amount');
const resultDisplay = document.getElementById('result');
const rateInfo = document.getElementById('rate-info');
const swapBtn = document.getElementById('swap');
let firstConversionDone = false;


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
  
  // Chama isto quando fizeres uma conversão
  function updateConversionAndSave() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) return;
    fetch(`${API}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`)
      .then(res => res.json())
      .then(data => {
        const rate = data.rates[toCurrency];
        resultDisplay.textContent = `${amount} ${fromCurrency} = ${rate} ${toCurrency}`;
        rateInfo.textContent = `1 ${fromCurrency} = ${(rate / amount).toFixed(4)} ${toCurrency}`;
        saveHistory(`${amount} ${fromCurrency} ➜ ${rate} ${toCurrency}`);
      });
  }

  document.getElementById('convert-btn').addEventListener('click', () => {
    updateConversion();
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
  
  
  
  
  
