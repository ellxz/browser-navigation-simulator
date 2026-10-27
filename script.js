
const backStack = [];
const forwardStack = [];
const browsingHistory = [];

const pages = {
  home: {
    title: "Welcome home!",
    eyebrow: "A FRESH LITTLE START",
    description: "Your browser is ready to explore. Choose a destination and let your journey begin.",
    icon: "✿"
  },
  about: {
    title: "A little about us",
    eyebrow: "GET TO KNOW US",
    description: "This mini browser demonstrates how browser navigation works using stacks and arrays.",
    icon: "♡"
  },
  learn: {
    title: "Your learning hub",
    eyebrow: "GROW YOUR KNOWLEDGE",
    description: "Explore programming, networking, web development, and the wonderful world of technology.",
    icon: "✧"
  },
  contact: {
    title: "Let's connect",
    eyebrow: "WE'D LOVE TO HEAR FROM YOU",
    description: "This is a simulated contact page. In a real website, you could add an email address or contact form.",
    icon: "✉"
  }
};

let currentPage = {
  key: "home",
  title: pages.home.title
};

const pageContent = document.getElementById("pageContent");
const addressInput = document.getElementById("addressInput");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const homeBtn = document.getElementById("homeBtn");
const historyList = document.getElementById("historyList");
const backStackList = document.getElementById("backStackList");
const forwardStackList = document.getElementById("forwardStackList");

function normalizeAddress(address) {
  const cleaned = address.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");

  const aliases = {
    "home": "home",
    "about": "about",
    "learn": "learn",
    "learning": "learn",
    "learning hub": "learn",
    "contact": "contact",
    "lavender.local": "home",
    "lavender.local/about": "about",
    "lavender.local/learn": "learn",
    "lavender.local/contact": "contact"
  };

  return aliases[cleaned] || "notfound";
}

function renderPage(key, recordHistory = true) {
  const page = pages[key];

  if (!page) {
    const attemptedAddress = addressInput.value.trim();

    pageContent.innerHTML = `
      <div class="welcome-icon">⌕</div>
      <p class="eyebrow">PAGE NOT FOUND</p>
      <h2>Oops, a little detour!</h2>
      <p>We couldn't find "${escapeHTML(attemptedAddress)}".
      Try home, about, learn, or contact.</p>
      <div class="page-links">
        <button class="page-link-button" data-page="home">Return home ↗</button>
      </div>
    `;

    currentPage = {
      key: "notfound",
      title: "Page not found"
    };
  } else {
    currentPage = {
      key,
      title: page.title
    };

    pageContent.innerHTML = `
      <div class="welcome-icon">${page.icon}</div>
      <p class="eyebrow">${page.eyebrow}</p>
      <h2>${page.title}</h2>
      <p>${page.description}</p>
      <div class="page-links">
        <button class="page-link-button" data-page="home">⌂ Home</button>
        <button class="page-link-button" data-page="about">♡ About</button>
        <button class="page-link-button" data-page="learn">✧ Learning Hub</button>
        <button class="page-link-button" data-page="contact">✉ Contact</button>
      </div>
    `;
  }

  addressInput.value = key === "notfound" ? addressInput.value : key;

  if (recordHistory) {
    browsingHistory.unshift({
      title: currentPage.title,
      key: currentPage.key,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    });

    // Keep the most recent 20 visits.
    browsingHistory.length = Math.min(browsingHistory.length, 20);
  }

  renderHistory();
  renderStacks();
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function navigateTo(address) {
  const target = normalizeAddress(address);

  if (target === currentPage.key) return;

  // PUSH: save the current page before leaving it.
  backStack.push({ ...currentPage });

  // A new destination clears the forward stack.
  forwardStack.length = 0;

  renderPage(target);
}

function goBack() {
  if (backStack.length === 0) return;

  // Save this page so Forward can return to it.
  forwardStack.push({ ...currentPage });

  // POP: remove the most recent page from the back stack.
  const previousPage = backStack.pop();

  renderPage(previousPage.key, true);
}

function goForward() {
  if (forwardStack.length === 0) return;

  // Save the current page in the back stack.
  backStack.push({ ...currentPage });

  // POP: retrieve the most recent forward page.
  const nextPage = forwardStack.pop();

  renderPage(nextPage.key, true);
}

function renderHistory() {
  document.getElementById("historyCount").textContent =
    browsingHistory.length;

  if (browsingHistory.length === 0) {
    historyList.innerHTML =
      '<p class="empty-state">Your journey starts here ✨</p>';
    return;
  }

  historyList.innerHTML = browsingHistory.map(item => `
    <div class="history-item">
      <span class="history-symbol">↗</span>
      <div>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.time)}</small>
      </div>
    </div>
  `).join("");
}

function renderStack(container, stack) {
  if (stack.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No pages yet</p>';
    return;
  }

  // Display the newest stack item at the top.
  container.innerHTML = [...stack].reverse().map((page, index) => `
    <div class="stack-item ${index === 0 ? "top-item" : ""}">
      <span class="stack-number">${stack.length - index}</span>
      <strong>${escapeHTML(page.title)}</strong>
      ${index === 0 ? '<span class="top-label">TOP</span>' : ""}
    </div>
  `).join("");
}

function renderStacks() {
  document.getElementById("backCount").textContent = backStack.length;
  document.getElementById("forwardCount").textContent = forwardStack.length;

  backBtn.disabled = backStack.length === 0;
  forwardBtn.disabled = forwardStack.length === 0;

  renderStack(backStackList, backStack);
  renderStack(forwardStackList, forwardStack);
}

// Address bar submission.
document.getElementById("addressForm").addEventListener("submit", event => {
  event.preventDefault();
  navigateTo(addressInput.value);
});

// Browser navigation controls.
backBtn.addEventListener("click", goBack);
forwardBtn.addEventListener("click", goForward);
homeBtn.addEventListener("click", () => navigateTo("home"));

// Quick-access buttons and page links.
document.addEventListener("click", event => {
  const button = event.target.closest("[data-page]");

  if (button) {
    navigateTo(button.dataset.page);
  }
});

// Clear the browsing history without changing navigation stacks.
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  browsingHistory.length = 0;
  renderHistory();
});

// Start the simulator.
renderPage("home");
