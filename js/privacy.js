function handleConsent(choice) {
    localStorage.setItem('kt_consent', choice);
    sessionStorage.removeItem('kt_banner_minimized');
    location.reload();
}

function resetKrainaPrivacy() {
    localStorage.removeItem('kt_consent');
    sessionStorage.removeItem('kt_banner_minimized');
    location.reload();
}

function hideBannerTemporarily() {
    sessionStorage.setItem('kt_banner_minimized', 'true');
    const overlay = document.getElementById('cookie-overlay');
    if (overlay) overlay.style.display = 'none';
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (header) header.classList.remove('content-blur');
    if (main) main.classList.remove('content-blur');
}

document.addEventListener('DOMContentLoaded', function () {
    const consent = localStorage.getItem('kt_consent');
    const isMinimized = sessionStorage.getItem('kt_banner_minimized');
    const overlay = document.getElementById('cookie-overlay');

    if (!consent && !isMinimized) {
        if (overlay) overlay.style.display = 'flex';
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        if (header) header.classList.add('content-blur');
        if (main) main.classList.add('content-blur');
    }
});