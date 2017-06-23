export class Overlay {
    
    constructor() {
        this.overlay = document.getElementById('overlay-main');
        this.overlayProgress = document.getElementById('overlay-progress');
        this.overlayBar = document.getElementById('overlay-bar');
        this.overlayMessage = document.getElementById('overlay-message');
    }
    
    open(message, withBar) {
        this.overlay.classList.remove('noshow');
        if (message) {
            this.overlayMessage.innerHTML = message;
            this.overlayMessage.classList.remove('noshow');
        } else {
            this.overlayMessage.classList.remove('noshow');
            this.overlayMessage.classList.add('noshow');
        }
        if (withBar) {
            this.overlayBar.style.width = '0%';
            this.overlayProgress.classList.remove('noshow');
        } else {
            this.overlayProgress.classList.remove('noshow');
            this.overlayProgress.classList.add('noshow');
        }
    }
    
    setPercent(percent) {
        this.overlayBar.style.width = percent + '%';
    }
    
    close() {
        this.overlay.classList.remove('noshow')
        this.overlay.classList.add('noshow');
    }
    
}