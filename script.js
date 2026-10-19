const form = document.querySelector("#converter-form");
const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#from-currency");
const toSelect = document.querySelector("#to-currency");
const swapButton = document.querySelector("#swap-button");
const convertButton = document.querySelector("#convert-button");
const statusMessage = document.querySelector("#status");
const resultPanel = document.querySelector("#result");
const convertedAmount = document.querySelector("#converted-amount");
const exchangeRate = document.querySelector("#exchange-rate");

const currencies = {
  AUD: "Australian Dollar",
  BRL: "Brazilian Real",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  KRW: "South Korean Won",
  MXN: "Mexican Peso",
  NZD: "New Zealand Dollar",
  SGD: "Singapore Dollar",
  USD: "US Dollar",
  ZAR: "South African Rand"
};

function populateCurrencyLists() {
  for (const [code, name] of Object.entries(currencies)) {
    const optionText = `${code} — ${name}`;

    fromSelect.add(new Option(optionText, code));
    toSelect.add(new Option(optionText, code));
  }

  fromSelect.value = "USD";
  toSelect.value = "INR";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const amount = Number(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (!Number.isFinite(amount) || amount <= 0) {
    showStatus("Enter an amount greater than zero.", true);
    resultPanel.hidden = true;
    return;
  }

  if (from === to) {
    displayConversion(amount, amount, from, to, 1);
    return;
  }

  setLoading(true);
  showStatus("Getting the latest available exchange rate…");
  resultPanel.hidden = true;

  try {
    const rate = await fetchExchangeRate(from, to);
    const result = amount * rate;

    displayConversion(amount, result, from, to, rate);
    showStatus("");
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    setLoading(false);
  }
});

swapButton.addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
});

async function fetchExchangeRate(from, to) {
  const url = `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not get exchange rates. Please try again.");
  }

  const data = await response.json();
  const rate = data.rates?.[to];

  if (typeof rate !== "number") {
    throw new Error("An exchange rate for these currencies was not found.");
  }

  return rate;
}

function displayConversion(amount, result, from, to, rate) {
  convertedAmount.textContent = formatMoney(result, to);
  exchangeRate.textContent =
    `1 ${from} = ${formatNumber(rate)} ${to}`;

  resultPanel.hidden = false;
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4
  }).format(value);
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  convertButton.disabled = isLoading;
  convertButton.textContent = isLoading ? "Converting…" : "Convert";
}

populateCurrencyLists();