const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const convertBtn = document.getElementById('convert-btn');
const resultDiv = document.getElementById('result');
const swapBtn = document.getElementById('swap');

const API_BASE = 'https://api.frankfurter.app';

// Lista fixa de moedas suportadas pela Frankfurter
const currencies = ["EUR", "USD", "GBP", "BRL", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK"];

function loadCurrencies() {
  currencies.forEach(currency => {
    fromCurrency.appendChild(new Option(currency, currency));
    toCurrency.appendChild(new Option(currency, currency));
  });

  fromCurrency.value = 'EUR';
  toCurrency.value = 'USD';

  convert();
}

async function convert() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amt = parseFloat(amountInput.value);

  if (isNaN(amt) || amt <= 0) {
    resultDiv.innerText = 'Insere um valor válido.';
    return;
  }

  if (from === to) {
    resultDiv.innerText = `${amt} ${from} = ${amt} ${to}`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/latest?amount=${amt}&from=${from}&to=${to}`);
    const data = await res.json();
    const converted = data.rates[to];
    resultDiv.innerText = `${amt} ${from} = ${converted} ${to}`;
  } catch (error) {
    console.error('Erro na conversão:', error);
    resultDiv.innerText = 'Erro ao converter moedas.';
  }
}

[fromCurrency, toCurrency, amountInput].forEach(el =>
  el.addEventListener('input', convert)
);

convertBtn.addEventListener('click', convert);

swapBtn.addEventListener('click', () => {
  [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
  convert();
});

// Iniciar
loadCurrencies();

