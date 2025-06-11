chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0].url;

    chrome.tabs.sendMessage(tabs[0].id, { action: "extractFeatures" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Content script not found or not responding.");
            return;
        }
        if (!response || !response.features) {
            console.error("No features returned from content script.");
            return;
        }

        const features = response.features;
        const prediction = score(features); // from model.js

        console.log(url);
        console.log("Features:", features);
        console.log("Prediction:", prediction);

        document.getElementById("status").innerText = "Prob of phish: " + prediction[0] + "\n" + features.join('\n');
    });
});
