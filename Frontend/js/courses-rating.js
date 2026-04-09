// courses-rating.js

async function getCourseRating(courseId) {
  try {
    const res = await fetch(`http://localhost:3000/api/reviews?courseId=${courseId}`);
    const reviews = res.ok ? await res.json() : [];
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
    return { avg: avg.toFixed(1), count: reviews.length };
  } catch (err) {
    return null;
  }
}

function renderStars(avg) {
  const rounded = Math.round(+avg);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= rounded
      ? '<i class="fas fa-star" style="color:#fbbf24"></i>'
      : '<i class="fas fa-star" style="color:#d1d5db"></i>';
  }
  return html;
}

window._getRating    = getCourseRating;
window._renderStars  = renderStars;