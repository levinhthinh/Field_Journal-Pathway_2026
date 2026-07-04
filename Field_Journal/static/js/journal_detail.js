function escapeHtml(str) {
  return (str ?? "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function loadEntry() {
  const card = document.getElementById("detail-card");
  const id = card.dataset.journalId;

  try {
    const res = await fetch(`/journal/journal/${id}/`, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Failed to load (${res.status})`);
    const entry = await res.json();
    renderEntry(entry);
  } catch (err) {
    console.error(err);
    card.innerHTML = `<p class="detail-error">Couldn't load this entry.</p>`;
  }
}

function renderEntry(entry) {
  const card = document.getElementById("detail-card");
  const images = entry.images || [];

  const imagesHtml = images.length
    ? `<div class="detail-images">${images
        .map((src) => `<img class="detail-image" src="${src}" alt="">`)
        .join("")}</div>`
    : "";

  card.innerHTML = `
    <div class="detail-top">
      <div>
        <h2 class="detail-title">${escapeHtml(entry.title || "Untitled")}</h2>
        <span class="detail-date">${fmtDate(entry.created)}</span>
      </div>
      <span class="emotion-badge emotion-${entry.emotion}">${(entry.emotion || "").toLowerCase()} &middot; ${entry.emotion_rating}/10</span>
    </div>
    ${entry.is_bookmark ? `<div class="detail-bookmark">&#9733; Bookmarked</div>` : ""}
    <p class="detail-text">${escapeHtml(entry.text)}</p>
    ${imagesHtml}
  `;

  card.querySelectorAll(".detail-image").forEach((img, idx) =>
    img.addEventListener("click", () => openLightbox(images, idx))
  );
}

loadEntry();

const lightboxState = { images: [], index: 0 };

function openLightbox(images, index) {
  lightboxState.images = images;
  lightboxState.index = index;
  renderLightboxImage();
  document.getElementById("lightbox").hidden = false;
}

function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
}

function renderLightboxImage() {
  const { images, index } = lightboxState;
  document.getElementById("lightbox-img").src = images[index];
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const multi = images.length > 1;
  prevBtn.hidden = !multi;
  nextBtn.hidden = !multi;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === images.length - 1;
}

function lightboxPrev() {
  if (lightboxState.index > 0) {
    lightboxState.index -= 1;
    renderLightboxImage();
  }
}
function lightboxNext() {
  if (lightboxState.index < lightboxState.images.length - 1) {
    lightboxState.index += 1;
    renderLightboxImage();
  }
}

document.getElementById("lightbox-close").addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });
document.getElementById("lightbox-prev").addEventListener("click", (e) => { e.stopPropagation(); lightboxPrev(); });
document.getElementById("lightbox-next").addEventListener("click", (e) => { e.stopPropagation(); lightboxNext(); });

document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id !== "lightbox-img") closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (document.getElementById("lightbox").hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightboxPrev();
  if (e.key === "ArrowRight") lightboxNext();
});