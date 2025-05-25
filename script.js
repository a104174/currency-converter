/* ---------- Elementos ---------- */
const fromSelect  = document.getElementById('from-currency');
const toSelect    = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const converted   = document.getElementById('converted-amount');
const rateInfo    = document.getElementById('rate-info');
const swapBtn     = document.getElementById('swap');

/* ---------- Dados & API ---------- */
const API = 'https://api.frankfurter.app';
const currencies = [
  {code:'EUR',flag:'🇪🇺'},
  {code:'USD',flag:'🇺🇸'},
  {code:'GBP',flag:'🇬🇧'},
  {code:'BRL',flag:'🇧🇷'},
  {code:'JPY',flag:'🇯🇵'},
  {code:'AUD',flag:'🇦🇺'},
  {code:'CAD',flag:'🇨🇦'},
  {code:'CHF',flag:'🇨🇭'},
  {code:'CNY',flag:'🇨🇳'},
  {code:'SEK',flag:'🇸🇪'},
];

/* ---------- Carregar selects ---------- */
function populateSelects(){
  currencies.forEach(({code,flag})=>{
    const opt1=new Option(`${flag} ${code}`,code);
    const opt2=new Option(`${flag} ${code}`,code);
    fromSelect.appendChild(opt1);
    toSelect.appendChild(opt2);
  });
  fromSelect.value='EUR';
  toSelect.value='USD';
}

/* ---------- Conversão ---------- */
async function convert(){
  const from=fromSelect.value, to=toSelect.value;
  const amount=parseFloat(amountInput.value);
  if(isNaN(amount)||amount<=0){converted.value='';rateInfo.textContent='';return;}
  if(from===to){converted.value=amount;rateInfo.textContent=`1 ${from} = 1 ${to}`;return;}

  try{
    const res=await fetch(`${API}/latest?amount=${amount}&from=${from}&to=${to}`);
    const data=await res.json();
    const rate=data.rates[to];
    converted.value=rate;
    rateInfo.textContent=`1 ${from} = ${rate/amount} ${to}`; // Frankfurter devolve já o total; dividir para taxa
  }catch(e){
    converted.value='';
    rateInfo.textContent='Erro ao obter taxa.';
    console.error(e);
  }
}

/* ---------- Eventos ---------- */
[fromSelect,toSelect,amountInput].forEach(el=>el.addEventListener('input',convert));
swapBtn.addEventListener('click',()=>{
  [fromSelect.value,toSelect.value]=[toSelect.value,fromSelect.value];
  convert();
});

/* ---------- Init ---------- */
populateSelects();
convert();

