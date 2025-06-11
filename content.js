(async () => {
    const {score} = await import(chrome.runtime.getURL('model.js'));

    const TOOLTIP_TIMEOUT = 2000;
    const PREDICTION_BIAS = 0.3;
    const PREDICTION_THRESHOLD = 0.3;
    const safeColor = [76, 175, 80];    // green
    const dangerColor = [244, 67, 54];  // red

    function extractFeatures(url) {
        const a = document.createElement('a');
        a.href = url;

        const features = [];

        const ipPattern = /(\b\d{1,3}(\.\d{1,3}){3}\b)/;
        features.push(ipPattern.test(a.hostname) ? -1 : 1);
        features.push(url.length < 54 ? 1 : url.length <= 75 ? 0 : -1);
        const shorteners = /(bit\.ly|goo\.gl|tinyurl\.com|ow\.ly|t\.co|bitly\.com|tinyurl)/i;
        features.push(shorteners.test(url) ? -1 : 1);
        features.push(url.includes('@') ? -1 : 1);
        const lastDoubleSlash = url.lastIndexOf('//');
        features.push(lastDoubleSlash > 7 ? -1 : 1);
        features.push(a.hostname.includes('-') ? -1 : 1);
        const dotsCount = a.hostname.split('.').length - 1;
        features.push(dotsCount === 1 ? 1 : -1);
        features.push(url.startsWith('https://') ? 1 : -1);
        features.push(0);
        features.push(checkFavicon());
        features.push([80, 443, ''].includes(a.port) ? 1 : -1);
        features.push(a.hostname.includes('https') ? -1 : 1);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(url.includes('mailto:') ? -1 : 1);
        features.push(url.includes(a.hostname) ? 1 : -1);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);
        features.push(0);

        return features;
    }

    function checkFavicon() {
        const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        if (!icon) return -1;
        const iconUrl = new URL(icon.href, location.href);
        console.log(iconUrl.hostname + " " + location.hostname);
        return iconUrl.hostname === location.hostname ? 1 : -1;
    }

    function lerpChannel(start, end, t) {
        return Math.round(start + (end - start) * t);
    }

    function lerpRGB(startRGB, endRGB, t) {
        const r = lerpChannel(startRGB[0], endRGB[0], t);
        const g = lerpChannel(startRGB[1], endRGB[1], t);
        const b = lerpChannel(startRGB[2], endRGB[2], t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.background = "gray";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "2px 6px";
    tooltip.style.fontSize = "12px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.zIndex = 9999;
    tooltip.style.display = "none";
    tooltip.className = "phishing-detector-tooltip";
    document.body.appendChild(tooltip);

    let hideTimeout = null;

    function showTooltip(target, text, color) {
        tooltip.textContent = text;
        tooltip.style.background = color;
        tooltip.style.top = (target.getBoundingClientRect().top + window.scrollY - 24) + "px";
        tooltip.style.left = (target.getBoundingClientRect().left + window.scrollX) + "px";
        tooltip.style.display = "block";

        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            tooltip.style.display = "none";
        }, TOOLTIP_TIMEOUT);
    }

    document.addEventListener("mouseover", (e) => {
        const a = e.target.closest("a[href]");
        if (!a) return;


        const features = extractFeatures(a.href);

        let prediction = score(features)[0];

        if(prediction >= PREDICTION_THRESHOLD) {
            let label = "Suspicious link";
            if (prediction > 0.75) label = "Phishing link";

            prediction = Math.min(prediction + PREDICTION_BIAS , 1.0);
            label += ": " + prediction.toFixed(3) + "%";
            const color = lerpRGB(safeColor, dangerColor, prediction);
            showTooltip(a, label, color);
        }

    });
})();