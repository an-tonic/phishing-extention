
(async () => {
    const {score} = await import(chrome.runtime.getURL('model_for_links.js'));
    const {featureExplanations} = await import(chrome.runtime.getURL('variables.js'));
    const { explanationPopup, explanationContent } = await import(chrome.runtime.getURL('explanation-popup.js'));


    const TOOLTIP_TIMEOUT = 2000;
    const PREDICTION_BIAS = 0.1;
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
        // features.push(0);
        // features.push(0);
        // features.push([80, 443, ''].includes(a.port) ? 1 : -1);
        features.push(a.hostname.includes('https') ? -1 : 1);
        // features.push(0); // request URL (If the external objects in a web page are loaded from another domain)
        // features.push(0); // URL of anchor (If the <a> tags and the website have different domain names.)
        // features.push(0); // links_in_tags' (tags are linked to the same domain of the webpage. )
        // features.push(0); //SFH (SFHs that contain an empty string or “about:blank”)
        // features.push(url.includes('mailto:') ? -1 : 1);
        // features.push(url.includes(a.hostname) ? 1 : -1);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);
        // features.push(0);

        return features;
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


    tooltip.appendChild(tooltipText);
    tooltip.appendChild(explanationLink);


    document.body.appendChild(tooltip);

    let hideTimeout = null;
    let currentAnchor = null;
    let lastFeatures = null;


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


    function showExplanationPopup(features) {

        const ul = document.createElement("ul");
        ul.style.margin = "0";
        ul.style.padding = "0";
        ul.style.listStyleType = "none";
        ul.style.fontSize = "13px";

        for (const key in features) {
            if (features[key] === -1) {
                const li = document.createElement("li");
                li.textContent = "❗" + featureExplanations[key];
                ul.appendChild(li);
            }
        }

        explanationContent.innerHTML = ""; // Clear previous content
        if (ul.children.length > 0) {

            explanationContent.appendChild(ul);
            explanationPopup.style.display = "block";
        } else {
            explanationPopup.style.display = "none";
        }
    }

    explanationLink.style.cursor = "pointer";
    explanationLink.addEventListener("click", (e) => {

        e.stopPropagation();
        e.preventDefault();
        if (lastFeatures) showExplanationPopup(lastFeatures);
    });

    document.addEventListener("mouseover", async (e) => {

        const domain = location.hostname;
        const {excludedDomains = []} = await chrome.storage.local.get('excludedDomains');
        if (excludedDomains.includes(domain)) return;

        const a = e.target.closest("a[href]");
        if (!a || a === currentAnchor) return;

        currentAnchor = a;
        cancelHideTooltip();

        const features = extractFeatures(a.href);
        console.log(features)
        let prediction = score(features)[0];
        console.log(score(features))
        if (prediction >= PREDICTION_THRESHOLD) {
            lastFeatures = features;

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