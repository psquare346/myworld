/* ============================================
   NASA – Live Space Data (ISS, APOD, Asteroids)
   ============================================ */

(function () {
  // ---- ISS Live Position ----
  const issLatEl = document.getElementById('iss-lat');
  const issLngEl = document.getElementById('iss-lng');
  const issCoordsEl = document.getElementById('iss-coords');

  async function fetchISS() {
    try {
      const res = await fetch('http://api.open-notify.org/iss-now.json');
      const data = await res.json();
      if (data.message === 'success') {
        const lat = parseFloat(data.iss_position.latitude);
        const lng = parseFloat(data.iss_position.longitude);

        if (issLatEl) issLatEl.textContent = lat.toFixed(4) + '°';
        if (issLngEl) issLngEl.textContent = lng.toFixed(4) + '°';
        if (issCoordsEl) issCoordsEl.textContent = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;

        // Update ISS marker on globe if available
        if (window.updateISSPosition) {
          window.updateISSPosition(lat, lng);
        }
      }
    } catch (err) {
      console.warn('ISS API unavailable', err);
    }
  }

  // Initial fetch + interval
  fetchISS();
  setInterval(fetchISS, 10000);

  // ---- NASA Astronomy Picture of the Day ----
  async function fetchAPOD() {
    const wrapper = document.getElementById('apod-image-wrapper');
    const titleEl = document.getElementById('apod-title');
    const descEl = document.getElementById('apod-desc');
    if (!wrapper) return;

    try {
      const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.media_type === 'image') {
        wrapper.innerHTML = `<img class="apod-image" src="${data.url}" alt="${data.title}" loading="lazy">`;
      } else if (data.media_type === 'video') {
        wrapper.innerHTML = `<iframe class="apod-video" src="${data.url}" frameborder="0" allowfullscreen></iframe>`;
      }

      if (titleEl) titleEl.textContent = data.title;
      if (descEl) {
        // Truncate long explanations
        const desc = data.explanation || '';
        descEl.textContent = desc.length > 300 ? desc.slice(0, 300) + '…' : desc;
      }
    } catch (err) {
      // Show fallback when rate-limited or unavailable
      if (wrapper) wrapper.innerHTML = '<img class="apod-image" src="https://apod.nasa.gov/apod/image/2403/ngc1232_vlt_960.jpg" alt="NGC 1232 Galaxy" loading="lazy">';
      if (titleEl) titleEl.textContent = 'NGC 1232 – A Grand Design Spiral Galaxy';
      if (descEl) descEl.textContent = 'NASA APOD is temporarily rate-limited. Visit apod.nasa.gov for today\'s image.';
      console.warn('APOD API error', err);
    }
  }

  fetchAPOD();

  // ---- Near-Earth Asteroids Today ----
  async function fetchAsteroids() {
    const countEl = document.getElementById('asteroid-count');
    const detailEl = document.getElementById('asteroid-detail');
    if (!countEl) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=DEMO_KEY`
      );
      const data = await res.json();
      const count = data.element_count || 0;
      countEl.textContent = count;

      // Show closest asteroid
      const neos = data.near_earth_objects?.[today] || [];
      if (neos.length > 0 && detailEl) {
        // Find the closest one
        let closest = neos[0];
        neos.forEach((neo) => {
          const dist = parseFloat(neo.close_approach_data?.[0]?.miss_distance?.kilometers || Infinity);
          const closestDist = parseFloat(closest.close_approach_data?.[0]?.miss_distance?.kilometers || Infinity);
          if (dist < closestDist) closest = neo;
        });

        const closeDist = closest.close_approach_data?.[0]?.miss_distance;
        const velocity = closest.close_approach_data?.[0]?.relative_velocity;
        const diameter = closest.estimated_diameter?.meters;
        const hazardous = closest.is_potentially_hazardous_asteroid;

        detailEl.innerHTML = `
          <div class="asteroid-closest">
            <div class="asteroid-closest-title">Closest: ${closest.name}</div>
            <div class="asteroid-stats-row">
              <div class="asteroid-mini-stat">
                <span class="asteroid-mini-label">Distance</span>
                <span class="asteroid-mini-value">${parseInt(closeDist?.kilometers).toLocaleString()} km</span>
              </div>
              <div class="asteroid-mini-stat">
                <span class="asteroid-mini-label">Speed</span>
                <span class="asteroid-mini-value">${parseInt(velocity?.kilometers_per_hour).toLocaleString()} km/h</span>
              </div>
              <div class="asteroid-mini-stat">
                <span class="asteroid-mini-label">Size</span>
                <span class="asteroid-mini-value">${diameter?.estimated_diameter_min?.toFixed(0)}–${diameter?.estimated_diameter_max?.toFixed(0)} m</span>
              </div>
            </div>
            ${hazardous ? '<div class="asteroid-hazard">⚠️ Potentially Hazardous</div>' : '<div class="asteroid-safe">✅ Not Hazardous</div>'}
          </div>
        `;
      }
    } catch (err) {
      if (countEl) countEl.textContent = '—';
      console.warn('NeoWs API error', err);
    }
  }

  fetchAsteroids();
})();
