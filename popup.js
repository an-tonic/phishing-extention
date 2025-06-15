document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('exclude-toggle');

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const url = new URL(tab.url);
    const domain = url.hostname;


    chrome.storage.local.get(['excludedDomains'], (result) => {
        const excluded = result.excludedDomains || [];
        toggle.checked = excluded.includes(domain);
    });

    toggle.addEventListener('change', () => {
        chrome.storage.local.get(['excludedDomains'], (result) => {
            const excluded = result.excludedDomains || [];
            if (toggle.checked && !excluded.includes(domain)) {
                excluded.push(domain);
            } else if (!toggle.checked) {
                const index = excluded.indexOf(domain);
                if (index > -1) excluded.splice(index, 1);
            }
            chrome.storage.local.set({ excludedDomains: excluded });
        });
    });
});
