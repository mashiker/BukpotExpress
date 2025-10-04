// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

let modalInstance = null;

function injectModalStyles() {
    if (document.getElementById('ct-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'ct-modal-styles';
    style.innerHTML = `
        .ct-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; transition: opacity 0.3s ease-in-out; }
        .ct-modal-content { background-color: #fff; padding: 24px; border-radius: 8px; width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); font-family: 'Poppins', 'Segoe UI', sans-serif; text-align: center; transform: scale(0.9); transition: transform 0.3s ease-in-out; }
        .ct-modal-content h2 { margin-top: 0; color: #2c3e50; }
        .modal-header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0; }
        .modal-header img { 
            height: 40px; 
            width: auto; /* DIUBAH: Lebar akan menyesuaikan secara otomatis */
        }
        .modal-header span { font-weight: 600; color: #7f8c8d; font-size: 14px; }
        .ct-modal-content p { color: #34495e; font-size: 16px; font-weight: 600; }
        .ct-modal-content .details { font-size: 14px; color: #7f8c8d; margin-top: -10px; margin-bottom: 20px; }
        .ct-modal-content button { background-color: #005A9C; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600; margin-top: 16px; transition: background-color 0.2s; }
        .ct-modal-content button:hover { background-color: #004170; }
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
                                        <span>CoreTax Assistant</span>
                </div>
                <h2 id="ct-modal-title"></h2>
                <p id="ct-modal-message"></p>
                <div id="ct-modal-details" class="details"></div>
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

    modalInstance.querySelector('#ct-modal-title').textContent = title;
    modalInstance.querySelector('#ct-modal-message').textContent = message;
    modalInstance.querySelector('#ct-modal-details').innerHTML = details;
    modalInstance.querySelector('#ct-modal-close-btn').style.display = showButton ? 'inline-block' : 'none';
}

function closeModal() {
    if (modalInstance) {
        modalInstance.style.opacity = '0';
        modalInstance.querySelector('.ct-modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            if (document.body.contains(modalInstance)) {
                document.body.removeChild(modalInstance);
            }
            modalInstance = null;
        }, 300);
    }
}

injectModalStyles();