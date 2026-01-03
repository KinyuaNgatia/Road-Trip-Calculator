document.addEventListener("DOMContentLoaded", () => {
  // Initial animations
  gsap.from(".container", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power3.out",
  });

  gsap.from("h1", {
    duration: 1,
    y: -20,
    opacity: 0,
    delay: 0.3,
    ease: "back.out(1.7)",
  });

  gsap.from(".input-group", {
    duration: 0.8,
    opacity: 0,
    y: 20,
    stagger: 0.1,
    delay: 0.5,
    ease: "power2.out",
  });

  gsap.from("button", {
    duration: 0.8,
    scale: 0.9,
    opacity: 0,
    delay: 1.2,
    ease: "elastic.out(1, 0.3)",
  });

  document.getElementById("calculateBtn").addEventListener("click", calculate);
});

function calculate() {
  const fuelPrice = 200;
  const markup = 0.15;
  const minMargin = 0.1;

  const clients = Number(document.getElementById("clients").value) || 0;
  const hireCost = Number(document.getElementById("hireCost").value) || 0;
  const distance = Number(document.getElementById("distance").value) || 0;
  const fuelEfficiency =
    Number(document.getElementById("fuelEfficiency").value) || 1; // Prevent division by zero

  const entryFee = Number(document.getElementById("entryFee").value) || 0;
  const activityFee = Number(document.getElementById("activityFee").value) || 0;
  const lunch = Number(document.getElementById("lunch").value) || 0;
  const snacks = Number(document.getElementById("snacks").value) || 0;

  const fuelLitres = distance / fuelEfficiency;
  const fuelCost = fuelLitres * fuelPrice;
  const transportCost = hireCost + fuelCost;

  const variableCostPerPerson = entryFee + activityFee + lunch + snacks;
  const totalVariableCost = variableCostPerPerson * clients;

  const totalCost = transportCost + totalVariableCost;
  const costPerPerson = clients > 0 ? totalCost / clients : 0;

  const breakEvenPrice = costPerPerson;
  const recommendedPrice = costPerPerson * (1 + markup);

  const revenue = recommendedPrice * clients;
  const profit = revenue - totalCost;
  const profitMargin = revenue > 0 ? profit / revenue : 0;

  let suggestion = `<div class="suggestion-box success">Pricing is healthy.</div>`;
  if (profitMargin < minMargin) {
    suggestion = `
      <div class="suggestion-box warning">
        <strong>Warning: Profit margin below 10%</strong>
        <ul>
          <li>Increase price per person</li>
          <li>Add 1–2 more clients</li>
          <li>Reduce lunch or activity cost</li>
        </ul>
      </div>`;
  }

  // Render logic optimized for structure
  const resultsContainer = document.getElementById("results");
  resultsContainer.style.opacity = 1;
  resultsContainer.innerHTML = `
    ${createResultCard('Recommended Price', recommendedPrice, true, false, 'hero-card')}
    ${createResultCard('Break-Even Price', breakEvenPrice)}
    ${createResultCard('Profit Margin', (profitMargin * 100).toFixed(1) + '%', false, true)}
    ${createResultCard('Total Profit', profit)}
    ${createResultCard('Cost Per Person', costPerPerson)}
    ${createResultCard('Total Trip Cost', totalCost)}
    ${createResultCard('Fuel Cost', fuelCost)}
    ${createResultCard('Total Transport', transportCost)}
    ${suggestion}
  `;

  // Animate results in
  gsap.from(".result-card, .suggestion-box", {
    duration: 0.6,
    y: 20,
    opacity: 0,
    stagger: 0.05,
    ease: "power2.out",
  });
}

function createResultCard(label, value, isHighlight = false, isText = false, extraClass = '') {
  const formattedValue = isText
    ? value
    : `KES ${Math.round(value).toLocaleString()}`;
  const style = isHighlight ? "color: var(--primary-color);" : "";
  return `
    <div class="result-card ${extraClass}" style="${style}">
      <div class="result-label">${label}</div>
      <div class="result-value">${formattedValue}</div>
    </div>
  `;
}
