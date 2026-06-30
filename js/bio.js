// ============================================
// 1. ZABEZPIECZENIE E-MAILA (ANTI-SPAM BOT)
// ============================================
function revealEmail(element, event) {
    event.preventDefault(); 
    
    const user = element.getAttribute('data-u');
    const domain = element.getAttribute('data-d');
    
    if (user && domain) {
        const emailAddress = user + '@' + domain;
        
        element.querySelector('.link-text').innerText = emailAddress;
        
        element.href = 'mailto:' + emailAddress;
        element.onclick = null; 
        element.style.borderColor = 'var(--accent)';
    }
}

// ============================================
// 2. SYSTEM TŁUMACZEŃ Z ANIMACJĄ (MODUŁOWY)
// ============================================
const i18n = {
    "pl": {
        // --- UNIWERSALNE ---
        "btn_yt": "Główny Kanał YouTube",
        "btn_ig": "Instagram",
        "btn_tt": "TikTok",
        "btn_email": "Pokaż adres e-mail",
        "btn_back": "Wróć do Krainy Twórców",
        
        // --- NIESKOT ---
        "desc_nieskot": "Twórca Krainy Twórców. Sprawdź moje sociale poniżej!",
        "btn_dc_nieskot_1": "Discord: Dolina Nieskota",
        "btn_dc_nieskot_2": "Discord: Nagrywkowy",

        // --- REKSKYY ---
        "desc_rekskyy": "Zarządca serwera. Witaj na moim profilu!",
        "btn_dc_rekskyy_1": "Discord: RexRP",
        "btn_dc_rekskyy_2": "Discord: Nagrywkowy"
    },
    "en": {
        // --- UNIWERSALNE ---
        "btn_yt": "Main YouTube Channel",
        "btn_ig": "Instagram",
        "btn_tt": "TikTok",
        "btn_email": "Reveal E-mail Address",
        "btn_back": "Return to main website",
        
        // --- NIESKOT ---
        "desc_nieskot": "Creator of Kraina Twórców. Check out my socials below!",
        "btn_dc_nieskot_1": "Discord: Nieskot's Valley",
        "btn_dc_nieskot_2": "Discord: Recording Server",

        // --- REKSKYY ---
        "desc_rekskyy": "Server Administrator. Welcome to my profile!",
        "btn_dc_rekskyy_1": "Discord: RexRP",
        "btn_dc_rekskyy_2": "Discord: Recording Server"
    }
};

let currentLang = "pl";
let isAnimating = false; 

function toggleLang() {
    if (isAnimating) return;
    isAnimating = true;

    const langBtn = document.getElementById('lang-switch');
    
    document.body.classList.add('lang-animating');
    
    setTimeout(() => {
        currentLang = currentLang === "pl" ? "en" : "pl";
        langBtn.innerText = currentLang === "pl" ? "EN" : "PL";
        document.documentElement.lang = currentLang;

        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (i18n[currentLang][key]) {
                element.innerText = i18n[currentLang][key];
            }
        });

        document.body.classList.remove('lang-animating');
        setTimeout(() => { isAnimating = false; }, 250);
        
    }, 250);
}