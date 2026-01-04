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

  /* Smart Suggestions calculations moved to after we have the element */

  const resultsContainer = document.getElementById("results");

  // Clear previous results to avoid duplicates if called multiple times (though currently we overwrite innerHTML)
  resultsContainer.innerHTML = "";
  resultsContainer.style.opacity = 1;

  // We need to store these for the dynamic updates
  window.currentCalculationData = {
    margin: profitMargin,
    minMargin,
    clients,
    transportCost,
    variableCostPerPerson,
    totalCost,
    profit,
    fuelCost,
    breakEvenPrice,
    costPerPerson,
  };

  // Generate initial HTML
  // We make Recommended Price an input
  const recommendedCardHtml = createResultCard(
    "Recommended Price",
    recommendedPrice,
    true,
    false,
    "hero-card",
    true
  );

  const initialSuggestions = generateSmartSuggestions(recommendedPrice);

  resultsContainer.innerHTML = `
    ${recommendedCardHtml}
    ${createResultCard("Break-Even Price", breakEvenPrice)}
    ${createResultCard(
      "Profit Margin",
      (profitMargin * 100).toFixed(1) + "%",
      false,
      true,
      "",
      false,
      "rc-profit-margin"
    )}
    ${createResultCard("Total Profit", profit, false, false, "", false, "rc-total-profit")}
    ${createResultCard("Cost Per Person", costPerPerson)}
    ${createResultCard("Total Trip Cost", totalCost)}
    ${createResultCard("Fuel Cost", fuelCost)}
    ${createResultCard("Total Transport", transportCost)}
    <div id="suggestions-container" style="grid-column: 1/-1; display: grid; gap: 10px;">${initialSuggestions}</div>
  `;

  // Animate results in
  gsap.from(".result-card, .suggestion-box, .opportunity-card", {
    duration: 0.6,
    y: 20,
    opacity: 0,
    stagger: 0.05,
    ease: "power2.out",
  });

  // Attach event listener to the new input
  const priceInput = document.getElementById("recommended-price-input");
  if (priceInput) {
    priceInput.addEventListener("input", (e) => {
      const newPrice = Number(e.target.value) || 0;
      updateResults(newPrice);
    });
  }
}

function updateResults(newPrice) {
    const { clients, transportCost, variableCostPerPerson, totalCost } = window.currentCalculationData;

    // Recalculate metrics based on new price
    const newRevenue = newPrice * clients;
    const newProfit = newRevenue - totalCost;
    const newMargin = newRevenue > 0 ? newProfit / newRevenue : 0;

    // Update DOM Elements
    updateCardValue('rc-profit-margin', (newMargin * 100).toFixed(1) + '%');
    updateCardValue('rc-total-profit', newProfit);
    // Break-even, Cost per person, Total Trip Cost, Fuel Cost, Total Transport DO NOT change when price changes, so no need to update them.
    
    // Update Suggestions
    const container = document.getElementById("suggestions-container");
    if (container) {
        container.innerHTML = generateSmartSuggestions(newPrice);
    }
}

function updateCardValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        const valEl = el.querySelector('.result-value');
        if (valEl) {
            valEl.textContent = typeof value === 'number' ? `KES ${Math.round(value).toLocaleString()}` : value;
        }
    }
}

function generateSmartSuggestions(price) {
  const {
    margin,
    minMargin,
    clients,
    transportCost,
    variableCostPerPerson,
    profit,
  } = window.currentCalculationData;

  // Recalculate margin based on new price
  const revenue = price * clients;
  const currentTotalCost = transportCost + variableCostPerPerson * clients;
  const currentProfit = revenue - currentTotalCost;
  const currentMargin = revenue > 0 ? currentProfit / revenue : 0;

  let html = "";

  // 1. Health Check
  if (currentMargin < minMargin) {
    html += `
      <div class="suggestion-box warning">
        <strong>⚠️ Low Profit Margin (${(currentMargin * 100).toFixed(
          1
        )}%)</strong>
        <p>Goal: 10%+. Suggestion: Increase price to <strong>KES ${Math.ceil(
          ((transportCost + variableCostPerPerson * clients) / clients) * 1.15
        ).toLocaleString()}</strong>.</p>
      </div>`;
  } else {
    html += `<div class="suggestion-box success">✅ Pricing is healthy at ${(
      currentMargin * 100
    ).toFixed(1)}% margin.</div>`;
  }

  // 2. Opportunities
  html +=
    '<h3 style="grid-column: 1/-1; margin-top: 20px; margin-bottom: 10px; font-size: 1.1rem; color: #4b5563;">💡 Smart Opportunities</h3>';

  // Op 1: Add Clients Logic (Loop 1 to 5)
  // We assume transport cost is fixed (vehicle hire + fuel) so it doesn't change with 1-5 extra people unless capacity is hit.
  // We'll assume capacity isn't hit for this simple calc.

  for (let i = 1; i <= 5; i++) {
    const newClients = clients + i;
    const newVariableCostTotal = variableCostPerPerson * newClients;
    const newTotalCost = transportCost + newVariableCostTotal;
    const newRevenue = price * newClients;
    const newProfit = newRevenue - newTotalCost;
    const profitDiff = newProfit - currentProfit;

    html += createOpportunityCard(
      `Add ${i} Client${i > 1 ? "s" : ""}`,
      `Total Profit increases by <strong style="color:var(--success-color)">KES ${Math.round(
        profitDiff
      ).toLocaleString()}</strong> to <strong>KES ${Math.round(
        newProfit
      ).toLocaleString()}</strong>.`,
      `border-left: 4px solid var(--primary-color);`
    );
  }

  // Op 2: Reduce Variable Costs by 10%
  const leanVariable = variableCostPerPerson * 0.9;
  const leanTotalCost = transportCost + leanVariable * clients;
  const leanProfit = price * clients - leanTotalCost;
  const leanProfitDiff = leanProfit - currentProfit;

  html += createOpportunityCard(
    `Reduce Food/Activity Costs by 10%`,
    `Profit boosts by <strong style="color:var(--success-color)">KES ${Math.round(
      leanProfitDiff
    ).toLocaleString()}</strong> to <strong>KES ${Math.round(
      leanProfit
    ).toLocaleString()}</strong>.`,
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

function createResultCard(
  label,
  value,
  isHighlight = false,
  isText = false,
  extraClass = "",
  isInput = false,
  id = ""
) {
  let innerContent;
  const style = isHighlight ? "color: var(--primary-color);" : "";

  if (isInput) {
    innerContent = `<input type="number" id="recommended-price-input" value="${Math.round(
      value
    )}" style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color); border: 1px solid #ddd; border-radius: 5px; padding: 5px; width: 100%; max-width: 150px; text-align: center;">`;
  } else {
    const formattedValue = isText
      ? value
      : `KES ${Math.round(value).toLocaleString()}`;
    innerContent = `<div class="result-value">${formattedValue}</div>`;
  }

  return `
    <div id="${id}" class="result-card ${extraClass}" style="${style}">
      <div class="result-label">${label}</div>
      ${innerContent}
    </div>
  `;
}

/* Chatbot Logic */
/* Note: Variables are re-declared here for clarity in this block, 
   but in strict mode inside a module or global, we should be careful. 
   Since this is a simple script, it's fine. */

// Wait for DOM or just run if deferred.
// We are at end of body so elements exist.

const chatWidget = document.getElementById("chat-widget");
const chatWindow = document.getElementById("chat-window");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatToggle = document.getElementById("chat-toggle");

// Toggle Chat
if (chatToggle) {
  chatToggle.addEventListener("click", () => {
    const isHidden =
      chatWindow.style.display === "none" || chatWindow.style.display === "";
    if (isHidden) {
      chatWindow.style.display = "flex";
      gsap.fromTo(
        chatWindow,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.2)" }
      );
      setTimeout(() => chatInput.focus(), 300);
    } else {
      gsap.to(chatWindow, {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.2,
        onComplete: () => (chatWindow.style.display = "none"),
      });
    }
  });
}

// Send Message
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Append user message
  appendMessage(text, "user");
  chatInput.value = "";

  // Loading indicator
  const loadingId = appendMessage("Thinking...", "bot", true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();

    // Remove loading and show response
    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();
    appendMessage(data.reply || "Sorry, I couldn't connect to the AI.", "bot");
  } catch (error) {
    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();
    appendMessage("Error: Is the backend server running?", "bot");
  }
}

if (chatSend) {
  chatSend.addEventListener("click", sendMessage);
}
if (chatInput) {
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

function appendMessage(text, sender, isLoading = false) {
  const id = "msg-" + Date.now();
  const div = document.createElement("div");
  div.id = id;
  div.className = `chat-message ${sender} ${isLoading ? "loading" : ""}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}
