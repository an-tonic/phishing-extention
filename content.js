(async () => {
    const {score} = await import(chrome.runtime.getURL('model.js'));

    const TOOLTIP_TIMEOUT = 2000;
    const PREDICTION_BIAS = 0.3;
    const PREDICTION_THRESHOLD = 0.0;
    const safeColor = [76, 175, 80];    
    const dangerColor = [244, 67, 54];  

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
    tooltip.style.background = "#000";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "2px 6px";
    tooltip.style.fontSize = "12px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.zIndex = "9999";
    tooltip.className = "phishing-detector-tooltip";
    tooltip.style.cursor = "default";
    tooltip.style.whiteSpace = "nowrap";
    tooltip.style.top = "-24px";
    tooltip.style.left = "0";
    tooltip.style.display = "none";

    const tooltipText = document.createElement("span");

    const explanationLink = document.createElement("span");
    explanationLink.innerText = "Why?";
    explanationLink.style.color = "#add8e6";
    explanationLink.style.marginLeft = "6px";
    explanationLink.style.fontSize = "11px";

    const explanationPopup = document.createElement("div");
    explanationPopup.style.position = "fixed";
    explanationPopup.style.top = "10px";
    explanationPopup.style.left = "10px";
    explanationPopup.style.background = "#fff";
    explanationPopup.style.color = "#000";
    explanationPopup.style.padding = "8px 12px";
    explanationPopup.style.border = "1px solid #ccc";
    explanationPopup.style.borderRadius = "6px";
    explanationPopup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    explanationPopup.style.fontSize = "13px";
    explanationPopup.style.maxWidth = "300px";
    explanationPopup.style.zIndex = "10000";
    explanationPopup.style.display = "none";


    tooltip.appendChild(tooltipText);
    tooltip.appendChild(explanationLink);

    document.body.appendChild(explanationPopup);
    document.body.appendChild(tooltip);

    let hideTimeout = null;
    let currentAnchor = null;

    function showTooltip(anchor, text, color) {
        tooltipText.textContent = text;
        tooltip.style.background = color;
        tooltip.style.display = "block";

        anchor.style.position = "relative";
        anchor.appendChild(tooltip);
    }

    function hideTooltipWithDelay() {
        hideTimeout = setTimeout(() => {
            tooltip.style.display = "none";
            if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
            currentAnchor = null;
        }, TOOLTIP_TIMEOUT);
    }

    function cancelHideTooltip() {
        clearTimeout(hideTimeout);
    }

    document.addEventListener("mouseover", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || a === currentAnchor) return;

        currentAnchor = a;
        cancelHideTooltip();

        const features = extractFeatures(a.href);
        let prediction = score(features)[0];

        if (prediction >= PREDICTION_THRESHOLD) {
            let label = "Suspicious link";
            if (prediction > 0.75) label = "Phishing link";

            prediction = Math.min(prediction + PREDICTION_BIAS, 1.0);
            label += ": " + prediction.toFixed(3);
            const color = lerpRGB(safeColor, dangerColor, prediction);

            showTooltip(a, label, color);
        }
    });

    
    document.addEventListener("mouseout", (e) => {
        const related = e.relatedTarget;
        if (
            currentAnchor &&
            !currentAnchor.contains(related) &&
            !tooltip.contains(related)
        ) {
            hideTooltipWithDelay();
        }
    });


    tooltip.addEventListener("mouseover", cancelHideTooltip);

    tooltip.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault(); 
    });


    tooltip.addEventListener("mouseout", (e) => {
        const related = e.relatedTarget;
        if (
            currentAnchor &&
            !currentAnchor.contains(related) &&
            !tooltip.contains(related)
        ) {
            hideTooltipWithDelay();
        }
    });

})();