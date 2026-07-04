async function fetchJournals() {
  const res = await fetch("/journal/journal/", { credentials: "same-origin" });
  const data = await res.json();
  return Array.isArray(data) ? data : data.results || [];
}

function lastSevenDays() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

async function initChart() {
  const journals = await fetchJournals();
  const days = lastSevenDays();

  const byDay = {};
  journals.forEach((entry) => {
    const key = dayKey(new Date(entry.created));
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(Number(entry.emotion_rating));
  });

  const labels = days.map((d) => d.toLocaleDateString(undefined, { weekday: "short" }));
  const values = days.map((d) => {
    const ratings = byDay[dayKey(d)];
    if (!ratings || !ratings.length) return null;
    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  });

  const hasData = values.some((v) => v !== null);
  document.getElementById("chart-empty").hidden = hasData;
  if (!hasData) return;

  const ctx = document.getElementById("emotion-canvas").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Emotion rating",
        data: values,
        borderColor: "#a78bfa",
        backgroundColor: "rgba(167, 139, 250, 0.15)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        spanGaps: true,
        pointBackgroundColor: "#a78bfa",
        pointRadius: 4,
      }],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { color: "#a599bb", stepSize: 2 },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        x: {
          ticks: { color: "#a599bb" },
          grid: { display: false },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

initChart();


