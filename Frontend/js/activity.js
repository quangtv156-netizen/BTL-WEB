// activity.js — ghi log hoạt động lên DB
const API = 'http://localhost:3000/api';

async function logActivity(icon, color, message, target = '') {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const userId = user ? user.id : null;

  try {
    await fetch(`${API}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: message,
        target
      })
    });
  } catch (err) {
    console.error("Lỗi ghi activity log:", err);
  }
}