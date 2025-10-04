// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

let modalInstance = null;

function injectModalStyles() {
    if (document.getElementById('ct-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'ct-modal-styles';
    style.innerHTML = `
        .ct-modal-overlay { position: fixed; top: 20px; right: 20px; width: auto; min-width: 300px; max-width: 400px; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; transition: opacity 0.3s ease-in-out; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .ct-modal-content { background-color: transparent; padding: 24px; border-radius: 12px; width: 100%; font-family: 'Poppins', 'Segoe UI', sans-serif; text-align: center; transform: scale(0.9); transition: transform 0.3s ease-in-out; }
        .ct-modal-content h2 { margin-top: 0; color: #2c3e50; font-size: 18px; }
        .modal-header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0; }
        .modal-header img {
            height: 32px;
            width: auto;
        }
        .modal-header span { font-weight: 600; color: #7f8c8d; font-size: 14px; }
        .ct-modal-content p { color: #34495e; font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .ct-modal-content .details { font-size: 14px; color: #7f8c8d; margin-top: 8px; margin-bottom: 20px; }
        .ct-modal-content button { background-color: #005A9C; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin-top: 16px; transition: background-color 0.2s; }
        .ct-modal-content button:hover { background-color: #004170; }

        /* Progress bar styling */
        .progress-container { width: 100%; height: 4px; background-color: #e0e0e0; border-radius: 2px; margin: 12px 0; overflow: hidden; }
        .progress-bar { height: 100%; background-color: #005A9C; border-radius: 2px; transition: width 0.3s ease; }
    `;
    document.head.appendChild(style);
}

function displayModal(title, message, details = '', showButton = true) {
    if (!modalInstance) {
        modalInstance = document.createElement('div');
        modalInstance.className = 'ct-modal-overlay';

        modalInstance.innerHTML = `
            <div class="ct-modal-content">
                <div class="modal-header">
                    <span>📄 Bukpot Express</span>
                </div>
                <h2 id="ct-modal-title"></h2>
                <p id="ct-modal-message"></p>
                <div id="ct-modal-details" class="details"></div>
                <div class="progress-container">
                    <div class="progress-bar" id="progress-bar"></div>
                </div>
                <button id="ct-modal-close-btn">Close</button>
            </div>
        `;

        document.body.appendChild(modalInstance);

        modalInstance.querySelector('#ct-modal-close-btn').addEventListener('click', () => {
            closeModal();
        });

        setTimeout(() => {
            modalInstance.style.opacity = '1';
            modalInstance.querySelector('.ct-modal-content').style.transform = 'scale(1)';
        }, 10);
    }

    // Update content
    modalInstance.querySelector('#ct-modal-title').textContent = title;
    modalInstance.querySelector('#ct-modal-message').textContent = message;
    modalInstance.querySelector('#ct-modal-details').innerHTML = details;
    modalInstance.querySelector('#ct-modal-close-btn').style.display = showButton ? 'inline-block' : 'none';

    // Update progress bar if it's a progress message
    const progressBar = modalInstance.querySelector('#progress-bar');
    const progressContainer = modalInstance.querySelector('.progress-container');

    if (title.includes('Download in Progress') || title.includes('Multi-Page Download')) {
        progressContainer.style.display = 'block';
        // Extract progress from message like "Downloading 1 of 5" or "Downloading Page 1"
        let percentage = 0;

        if (message.includes('Page')) {
            // Multi-page download: show simple animated progress
            const time = Date.now() / 1000;
            percentage = (Math.sin(time) + 1) * 50; // Oscillating progress for multi-page
        } else {
            // Single page download: extract exact progress
            const progressMatch = message.match(/(\d+) of (\d+)/);
            if (progressMatch) {
                const current = parseInt(progressMatch[1]);
                const total = parseInt(progressMatch[2]);
                percentage = (current / total) * 100;
            }
        }

        progressBar.style.width = percentage + '%';
    } else if (title.includes('Complete')) {
        progressContainer.style.display = 'block';
        progressBar.style.width = '100%';
    } else {
        progressContainer.style.display = 'none';
    }
}

function closeModal() {
    if (modalInstance) {
        modalInstance.style.opacity = '0';
        modalInstance.querySelector('.ct-modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            if (modalInstance && document.body.contains(modalInstance)) {
                document.body.removeChild(modalInstance);
            }
            modalInstance = null;
            console.log("Modal closed successfully");
        }, 200); // Reduced timeout for faster closing
    }
}

injectModalStyles();