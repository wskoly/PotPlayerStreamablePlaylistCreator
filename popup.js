document.getElementById('dplGenButton').addEventListener('click', () => {
    scrapeMediaFiles((mediaFiles) => {
        if (mediaFiles && mediaFiles.length > 0) {
            const dplContent = generateDPLContent(mediaFiles);

            const blob = new Blob([dplContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            let mediaFilePaths = decodeURI(mediaFiles[0]).split('/');
            mediaFilePaths.pop();
            const mediaFilePathsLen = mediaFilePaths.length;
            const dplFileName = ((mediaFilePathsLen >= 2)
                ? `${mediaFilePaths[mediaFilePathsLen - 2]}_${mediaFilePaths[mediaFilePathsLen - 1]}`
                : mediaFilePaths.pop()) + ".dpl";
            const a = document.createElement('a');
            a.href = url;
            a.download = dplFileName;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert("No media files found on this page.");
        }
    });
});

document.getElementById('downloadMediaButton').addEventListener('click', () => {
    scrapeMediaFiles((mediaFiles) => {
        if (mediaFiles && mediaFiles.length > 0) {
            // check for confirmation from the user
            const confirmation = confirm("Are you sure you want to download all media files?");
            if (!confirmation) {
                return;
            }
            // show a progress indicator
            const progressIndicator = document.createElement('div');
            progressIndicator.textContent = "Downloading media files...";
            progressIndicator.style.position = "fixed";
            progressIndicator.style.top = "10px";
            progressIndicator.style.right = "10px";
            progressIndicator.style.backgroundColor = "white";
            progressIndicator.style.border = "1px solid black";
            progressIndicator.style.padding = "10px";
            progressIndicator.style.zIndex = "9999";
            document.body.appendChild(progressIndicator);
            // download each media file
            mediaFiles.forEach((fileUrl) => {
                chrome.downloads.download({
                    url: fileUrl,
                    saveAs: false
                });
            });
            // remove the progress indicator after a delay
            setTimeout(() => {
                document.body.removeChild(progressIndicator);
            }, 5000); // remove after 5 seconds
        } else {
            alert("No media files found on this page.");
        }
    });
});

function scrapeMediaFiles(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.runtime.sendMessage(
            { action: "scrapeMedia", tabId: activeTab.id },
            (response) => {
                if (response && response.mediaFiles && response.mediaFiles.length > 0) {
                    callback(response.mediaFiles);
                } else {
                    callback(null);
                }
            }
        );
    });
}

function generateDPLContent(mediaFiles) {
    let dplContent = "DAUMPLAYLIST\n";
    dplContent += "topindex=0\n";

    mediaFiles.forEach((file, index) => {
        dplContent += `${index + 1}*file*${file}\n`;
    });

    return dplContent;
}
