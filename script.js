
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const amount = document.getElementById('amount');
const convertBtn = document.getElementById('convert-btn');
const resultDiv = document.getElementById('result');
const swapBtn = document.getElementById('swap');

const API_URL = 'https://api.exchangerate.host/latest';

async function fetchCurrencies() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log("Resposta da API:", data); // debug

    if (!data.rates) {
      resultDiv.innerText = "Erro ao carregar moedas.";
      return;
    }

    const currencies = Object.keys(data.rates);

    currencies.forEach(currency => {
      const option1 = new Option(currency, currency);
      const option2 = new Option(currency, currency);
      fromCurrency.appendChild(option1);
      toCurrency.appendChild(option2);
    });

    fromCurrency.value = 'EUR';
    toCurrency.value = 'USD';

    convert();
  } catch (err) {
    console.error("Erro ao buscar moedas:", err);
    resultDiv.innerText = "Erro de conexão com a API.";
  }
}

async function convert() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amt = parseFloat(amount.value);

  if (isNaN(amt) || amt <= 0) {
    resultDiv.innerText = "Insere um valor válido.";
    return;
  }

  try {
    const res = await fetch(`${API_URL}?base=${from}&symbols=${to}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amt * rate).toFixed(2);

    resultDiv.innerText = `${amt} ${from} = ${converted} ${to}`;
  } catch (err) {
    console.error("Erro ao converter:", err);
    resultDiv.innerText = "Erro ao converter moedas.";
  }
}

[fromCurrency, toCurrency, amount].forEach(el =>
  el.addEventListener('input', convert)
);

convertBtn.addEventListener('click', convert);

swapBtn.addEventListener('click', () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  convert();
});

fetchCurrencies();
