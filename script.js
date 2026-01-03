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

  // Smart Suggestions
  const suggestions = generateSmartSuggestions(
    profitMargin, 
    minMargin, 
    clients, 
    transportCost,
    variableCostPerPerson,
    recommendedPrice,
    profit
  );
  
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
    ${suggestions}
  `;

  // Animate results in
  gsap.from(".result-card, .suggestion-box, .opportunity-card", {
    duration: 0.6,
    y: 20,
    opacity: 0,
    stagger: 0.05,
    ease: "power2.out"
  });
}

function generateSmartSuggestions(margin, minMargin, clients, fixedCost, variableCost, price, currentProfit) {
  let html = '';
  
  // 1. Health Check
  if (margin < minMargin) {
    html += `
      <div class="suggestion-box warning">
        <strong>⚠️ Low Profit Margin (${(margin * 100).toFixed(1)}%)</strong>
        <p>Goal: 10%+. Suggestion: Increase price to <strong>KES ${Math.ceil((fixedCost + (variableCost * clients)) / clients * 1.15).toLocaleString()}</strong>.</p>
      </div>`;
  } else {
     html += `<div class="suggestion-box success">✅ Pricing is healthy.</div>`;
  }

  // 2. Opportunities
  html += '<h3 style="grid-column: 1/-1; margin-top: 20px; margin-bottom: 10px; font-size: 1.1rem; color: #4b5563;">💡 Smart Opportunities</h3>';

  // Op 1: Add 1 Client
  if (clients < 50) { // arbitrary max
    const newClients = clients + 1;
    const newTotalCost = fixedCost + (variableCost * newClients);
    const newRevenue = price * newClients;
    const newProfit = newRevenue - newTotalCost;
    const profitDiff = newProfit - currentProfit;
    
    html += createOpportunityCard(
      `Add 1 Client`, 
      `Total Profit increases by <strong style="color:var(--success-color)">KES ${Math.round(profitDiff).toLocaleString()}</strong> to <strong>KES ${Math.round(newProfit).toLocaleString()}</strong> (keeping price constant).`,
      `border-left: 4px solid var(--primary-color);`
    );
  }

  // Op 2: Reduce Variable Costs by 10%
  const leanVariable = variableCost * 0.9;
  const leanTotalCost = fixedCost + (leanVariable * clients);
  const leanProfit = (price * clients) - leanTotalCost;
  const leanProfitDiff = leanProfit - currentProfit;
  
  html += createOpportunityCard(
    `Reduce Food/Activity Costs by 10%`, 
    `Profit boosts by <strong style="color:var(--success-color)">KES ${Math.round(leanProfitDiff).toLocaleString()}</strong> to <strong>KES ${Math.round(leanProfit).toLocaleString()}</strong>.`,
    `border-left: 4px solid var(--success-color);`
  );

  return html;
}

function createOpportunityCard(title, desc, style) {
  return `
    <div class="opportunity-card" style="grid-column: 1/-1; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); ${style}">
      <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">${title}</div>
      <div style="font-size: 0.9rem; color: #4b5563;">${desc}</div>
    </div>
  `;
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
