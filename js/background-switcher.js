document.addEventListener('DOMContentLoaded', () => {
    const bgUpload = document.getElementById('bg-upload');
    const preview = document.getElementById('preview');
    const clearBgBtn = document.getElementById('clear-bg');
    const saveBgBtn = document.getElementById('save-bg');
    const styleButtons = document.querySelectorAll('.style-button');
    const blurSlider = document.getElementById('blur-slider');
    const blurValue = document.getElementById('blur-value');
    const antialiasingToggle = document.getElementById('antialiasing-toggle');

    const SETTINGS_KEY = 'bgSettings';
    let savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    const backgroundContainer = (() => {
        let container = document.getElementById('background-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'background-container';
            Object.assign(container.style, {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: '-1',
                pointerEvents: 'none'
            });
            document.body.prepend(container);
        }
        return container;
    })();

    function applySettings() {
        const { url, position = 'fit', blur = 0, antialiasing = true } = savedSettings;
    
        if (url) {
            backgroundContainer.style.backgroundImage = `url(${url})`;
            if (preview) preview.style.backgroundImage = `url(${url})`;
        } else {
            backgroundContainer.style.backgroundImage = '';
            if (preview) preview.style.backgroundImage = '';
        }
    
        backgroundContainer.style.backgroundRepeat = 'no-repeat';
        backgroundContainer.style.backgroundPosition = 'center';
        backgroundContainer.style.backgroundSize = 'cover'; // default fallback
    
        switch (position) {
            case 'fit':
                backgroundContainer.style.backgroundSize = 'contain';
                break;
            case 'stretch':
                backgroundContainer.style.backgroundSize = '100% 100%';
                break;
            case 'tiles':
                backgroundContainer.style.backgroundRepeat = 'repeat';
                backgroundContainer.style.backgroundSize = 'auto';
                break;
            case 'fit-centered':
                backgroundContainer.style.backgroundSize = 'auto 100%'; // fit height
                backgroundContainer.style.backgroundRepeat = 'no-repeat';
                backgroundContainer.style.backgroundPosition = 'center';
                break;
        }
    
        backgroundContainer.style.filter = `blur(${blur}px)`;
        if (blurSlider) blurSlider.value = blur;
        if (blurValue) blurValue.textContent = blur;
    
        backgroundContainer.style.imageRendering = antialiasing ? 'auto' : 'pixelated';
        if (antialiasingToggle) antialiasingToggle.checked = antialiasing;
    
        if (styleButtons) {
            styleButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.bgImage === position);
            });
        }
    }
    

    function saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(savedSettings));
    }

    // Load settings on all pages
    applySettings();

    if (bgUpload) {
        bgUpload.addEventListener('change', () => {
            const file = bgUpload.files[0];
            if (!file || !file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                savedSettings.url = e.target.result;
                if (preview) preview.style.backgroundImage = `url(${savedSettings.url})`;
            };
            reader.readAsDataURL(file);
        });
    }

    if (clearBgBtn) {
        clearBgBtn.addEventListener('click', () => {
            savedSettings = {};
            saveSettings();
            applySettings();
        });
    }

    if (saveBgBtn) {
        saveBgBtn.addEventListener('click', () => {
            saveSettings();
            applySettings();
        });
    }

    if (styleButtons) {
        styleButtons.forEach(button => {
            button.addEventListener('click', () => {
                savedSettings.position = button.dataset.bgImage;
                applySettings();
            });
        });
    }

    if (antialiasingToggle) {
        antialiasingToggle.addEventListener('change', () => {
            savedSettings.antialiasing = antialiasingToggle.checked;
            applySettings();
        });
    }

    if (blurSlider) {
        blurSlider.addEventListener('input', () => {
            const blur = parseInt(blurSlider.value, 10);
            savedSettings.blur = isNaN(blur) ? 0 : blur;
            if (blurValue) blurValue.textContent = blur;
            applySettings();
        });
    }

    window.addEventListener('resize', () => {
        if (savedSettings.url && savedSettings.position === 'fit') {
            applySettings();
        }
    });

    document.addEventListener('bg-settings-updated', () => {
        savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
        applySettings();
    });
});
