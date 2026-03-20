/* ============================================
   Facts – Live API Fun Facts Engine
   ============================================ */

(function () {
  const factText = document.getElementById('fact-text');
  const factCard = document.getElementById('fact-card');
  if (!factText || !factCard) return;

  // Fallback facts for offline resilience
  const fallbackFacts = [
    "The first computer bug was an actual moth found in a Harvard relay computer in 1947.",
    "Human DNA is 99.9% identical between any two people on the planet.",
    "A single Google search uses roughly 0.3 watt-hours of energy.",
    "The world's first website is still online at info.cern.ch.",
    "Honey never spoils — archaeologists have found 3,000-year-old edible honey.",
    "Octopuses have three hearts and blue blood.",
    "More people have cell phones than toilets worldwide.",
    "A day on Venus is longer than a year on Venus.",
    "The human brain can process images in as little as 13 milliseconds.",
    "There are more possible chess games than atoms in the observable universe.",
  ];

  let fallbackIndex = 0;
  let isFirstLoad = true;

  async function fetchFact() {
    try {
      const response = await fetch(
        'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en',
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      return data.text || getNextFallback();
    } catch (err) {
      return getNextFallback();
    }
  }

  function getNextFallback() {
    const fact = fallbackFacts[fallbackIndex];
    fallbackIndex = (fallbackIndex + 1) % fallbackFacts.length;
    return fact;
  }

  async function showFact() {
    // Fade out
    factCard.classList.remove('visible');

    await new Promise((r) => setTimeout(r, 600));

    // Get new fact
    const fact = await fetchFact();
    factText.textContent = fact;

    // Fade in
    factCard.classList.add('visible');
  }

  // Initial load (faster first time)
  setTimeout(async () => {
    await showFact();
    isFirstLoad = false;
  }, 1500);

  // Cycle every 8 seconds
  setInterval(showFact, 8000);
})();
