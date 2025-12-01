console.log('Background script loaded');

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "send-to-cv-ai",
        title: "Send to CV AI",
        contexts: ["selection"]
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "send-to-cv-ai" && info.selectionText) {
        // Store the selected text in local storage so the popup can read it
        chrome.storage.local.set({ 'pendingJobDescription': info.selectionText }, () => {
            console.log('Job description saved to storage');
            // Optionally open the popup or notify the user
            // Note: We cannot programmatically open the popup from background script in all cases,
            // but we can show a badge or notification.
            chrome.action.setBadgeText({ text: "!" });
            chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
        });
    }
});
