/* ============================================
   Intake Form – Multi-step wizard + Google Apps Script email
   ============================================ */

(function () {
  const form = document.getElementById('intake-form');
  if (!form) return;

  // ⬇️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⬇️
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUZB8T0EIyVSw48APrb8tTvgXdr7fcRehWjY3ostn-a2l4jrf9_t5CrkY75oQNIbZpDw/exec';

  const steps = form.querySelectorAll('.form-step');
  const progressDots = document.querySelectorAll('.progress-dot');
  const progressFill = document.querySelector('.progress-fill');
  const prevBtn = document.getElementById('intake-prev');
  const nextBtn = document.getElementById('intake-next');
  const submitBtn = document.getElementById('intake-submit');
  const successEl = document.getElementById('intake-success');
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    progressDots.forEach((d, i) => {
      d.classList.toggle('active', i <= index);
      d.classList.toggle('completed', i < index);
    });
    const pct = (index / (steps.length - 1)) * 100;
    if (progressFill) progressFill.style.width = pct + '%';

    prevBtn.style.display = index === 0 ? 'none' : 'inline-flex';
    nextBtn.style.display = index === steps.length - 1 ? 'none' : 'inline-flex';
    submitBtn.style.display = index === steps.length - 1 ? 'inline-flex' : 'none';
  }

  function validateStep(index) {
    const step = steps[index];
    const required = step.querySelectorAll('[required]');
    let valid = true;
    required.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('input-error');
        valid = false;
      } else {
        input.classList.remove('input-error');
      }
    });
    return valid;
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Collect form data as JSON
  function collectFormData() {
    const fd = new FormData(form);
    const services = fd.getAll('service_type');
    return {
      client_name: fd.get('client_name') || '',
      client_email: fd.get('client_email') || '',
      client_business: fd.get('client_business') || '',
      client_industry: fd.get('client_industry') || '',
      pain_point: fd.get('pain_point') || '',
      current_tools: fd.get('current_tools') || '',
      tried_before: fd.get('tried_before') || '',
      service_type: services.length ? services.join(', ') : 'N/A',
      budget: fd.get('budget') || '',
      timeline: fd.get('timeline') || '',
      extra_details: fd.get('extra_details') || ''
    };
  }

  // Build mailto fallback
  function buildMailtoFallback(data) {
    const subject = encodeURIComponent('New Project Inquiry from ' + data.client_name);
    let body = '=== ABOUT ===\n';
    body += 'Name: ' + data.client_name + '\nEmail: ' + data.client_email;
    body += '\nBusiness: ' + data.client_business + '\nIndustry: ' + data.client_industry;
    body += '\n\n=== CHALLENGE ===\n' + data.pain_point;
    body += '\nCurrent Tools: ' + data.current_tools;
    body += '\nTried Before: ' + data.tried_before;
    body += '\n\n=== PROJECT ===\nServices: ' + data.service_type;
    body += '\nBudget: ' + data.budget + '\nTimeline: ' + data.timeline;
    body += '\nDetails: ' + data.extra_details;
    return 'mailto:psquare346@gmail.com?subject=' + subject + '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const data = collectFormData();

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-glow"></span>Sending...';

    // If Apps Script URL is configured, use it; otherwise fallback to mailto
    if (APPS_SCRIPT_URL) {
      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(data)
        });

        // Show success (no-cors means we can't read response, but Apps Script will send the email)
        form.style.display = 'none';
        successEl.style.display = 'flex';
      } catch (err) {
        // Fallback to mailto on network error
        window.location.href = buildMailtoFallback(data);
        form.style.display = 'none';
        successEl.style.display = 'flex';
      }
    } else {
      // No Apps Script URL configured — use mailto
      window.location.href = buildMailtoFallback(data);
      form.style.display = 'none';
      successEl.style.display = 'flex';
    }
  });

  // Remove error styling on input
  form.addEventListener('input', (e) => {
    e.target.classList.remove('input-error');
  });

  // Initialize
  showStep(0);
})();
