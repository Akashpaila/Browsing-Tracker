document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['siteData'], (result) => {
    const siteData = result.siteData || {};
    const table = document.getElementById('statsTable');
    for (const [url, data] of Object.entries(siteData)) {
      const row = table.insertRow();
      row.insertCell(0).textContent = url;
      row.insertCell(1).textContent = (data.timeSpent / 60).toFixed(2); 
      row.insertCell(2).textContent = data.visits;
    }
  });
});