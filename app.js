const startBtn = document.getElementById("startBtn");
const statusDiv = document.getElementById("status");
const notificationsInput = document.getElementById("notificationsInput");
const scheduleList = document.getElementById("scheduleList");

let timers = [];

function clearAllTimers() {
  timers.forEach(timer => clearTimeout(timer));
  timers = [];
}

function formatTime(date) {
  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Browserul tău nu suportă notificări.");
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

function parseNotifications(text) {
  const lines = text.trim().split("\n");
  const list = [];
  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length !== 2) continue;
    const time = parseInt(parts[0].trim());
    const message = parts[1].trim();
    if (!isNaN(time) && message.length > 0) {
      list.push({ time, message });
    }
  }
  return list;
}

async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      console.log('Service Worker înregistrat');
      return reg;
    } catch (error) {
      console.error('Eroare la înregistrarea Service Worker:', error);
      return null;
    }
  }
  return null;
}

startBtn.addEventListener("click", async () => {
  statusDiv.textContent = "";
  scheduleList.textContent = "";
  clearAllTimers();

  const granted = await requestNotificationPermission();
  if (!granted) {
    statusDiv.textContent = "Permisiunea pentru notificări a fost refuzată.";
    return;
  }

  const swRegistration = await registerSW();
  if (!swRegistration) {
    statusDiv.textContent = "Nu s-a putut înregistra Service Worker.";
    return;
  }

  const notifications = parseNotifications(notificationsInput.value);
  if (notifications.length === 0) {
    statusDiv.textContent = "Te rog introdu notificări valide.";
    return;
  }

  const now = new Date();

  notifications.forEach(notif => {
    const notifyTime = new Date(now.getTime() + notif.time * 60000);

    const p = document.createElement("p");
    p.textContent = `La ora ${formatTime(notifyTime)} → ${notif.message}`;
    scheduleList.appendChild(p);

    const timerId = setTimeout(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          command: 'showNotification',
          message: notif.message
        });
      } else {
        console.warn('Service Worker controller nu este disponibil.');
      }
    }, notif.time * 60000);

    timers.push(timerId);
  });

  statusDiv.textContent = `Timer pornit cu ${notifications.length} notificări.`;
});
