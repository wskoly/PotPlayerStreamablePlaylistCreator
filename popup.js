document.getElementById('scrapeButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];

        chrome.runtime.sendMessage(
            { action: "scrapeMedia", tabId: activeTab.id },
            (response) => {
                if (response && response.mediaFiles && response.mediaFiles.length > 0) {
                    const mediaFiles = response.mediaFiles;
                    const dplContent = generateDPLContent(mediaFiles);

                    const blob = new Blob([dplContent], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    let mediaFilePaths = decodeURI(mediaFiles[0]).split('/');
                    mediaFilePaths.pop();
                    const mediaFilePathsLen = mediaFilePaths.length;
                    const dplFileName = ((mediaFilePathsLen >= 2) ? `${mediaFilePaths[mediaFilePathsLen - 2]}_${mediaFilePaths[mediaFilePathsLen - 1]}` : mediaFilePaths.pop()) + ".dpl";
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = dplFileName;
                    a.click();
                    URL.revokeObjectURL(url);
                } else {
                    alert("No media files found on this page.");
                }
            }
        );
    });
});

function generateDPLContent(mediaFiles) {
    let dplContent = "DAUMPLAYLIST\n";
    dplContent += "topindex=0\n";

    mediaFiles.forEach((file, index) => {
        dplContent += `${index + 1}*file*${file}\n`;
    });

    return dplContent;
}
