'use strict';

const $ = function(elem) {
    return document.querySelector(elem);
};

function updateAvailableResponse(available) {
    if (available) {
        $('#update-available').show();
    }
}

async function initSettings() {
    $('#settings #options-button').addEventListener('click', () => {
        browser.runtime.openOptionsPage().then(close());
    });

    const customLoginFieldsButton = document.body.querySelector('#settings #choose-custom-login-fields-button');
    customLoginFieldsButton.id = getIconClass('choose-custom-login-fields-button');

    customLoginFieldsButton.addEventListener('click', async () => {
        const tab = await getCurrentTab();
        browser.tabs.sendMessage(tab?.id, {
            action: 'choose_credential_fields'
        });
        close();
    });
}

async function initColorTheme() {
    let theme = await browser.runtime.sendMessage({
        action: 'get_color_theme'
    });
    if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-bs-theme', theme);
}

// Builds a credential row: initial avatar, title and a muted subtitle.
// The row keeps its full text in data-search so filtering still matches everything.
function createLoginRow(id, title, subtitle, searchText) {
    const a = document.createElement('a');
    a.setAttribute('class', 'list-group-item login-row');
    a.setAttribute('id', '' + id);
    a.setAttribute('href', '#');
    a.dataset.search = searchText || `${title} ${subtitle || ''}`;

    const avatar = document.createElement('span');
    avatar.className = 'login-avatar';
    const initial = (title || subtitle || '?').trim().charAt(0).toUpperCase() || '?';
    avatar.textContent = initial;
    // Stable per-title hue so the same login always gets the same colour.
    let hash = 0;
    for (const ch of (title || '')) {
        hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    }
    avatar.style.setProperty('--avatar-hue', String(Math.abs(hash) % 360));

    const text = document.createElement('span');
    text.className = 'login-text';
    const titleEl = document.createElement('span');
    titleEl.className = 'login-title';
    titleEl.textContent = title;
    text.appendChild(titleEl);
    if (subtitle) {
        const sub = document.createElement('span');
        sub.className = 'login-subtitle';
        sub.textContent = subtitle;
        text.appendChild(sub);
    }

    const chevron = document.createElement('i');
    chevron.className = 'fa fa-angle-right login-chevron';
    chevron.setAttribute('aria-hidden', 'true');

    a.append(avatar, text, chevron);
    return a;
}

// Case-insensitive substring filter over the rows built by createLoginRow().
function filterLoginRows(list, value) {
    const needle = value.trim().toLowerCase();
    for (const row of list.querySelectorAll('a.login-row')) {
        const haystack = (row.dataset.search || row.textContent).toLowerCase();
        row.style.display = haystack.includes(needle) ? '' : 'none';
    }
}

async function getLoginData(useBasicAuth = false) {
    const tab = await getCurrentTab();
    if (!tab) {
        return [];
    }

    const logins = await browser.runtime.sendMessage({
        action: 'get_login_list',
        args: useBasicAuth
    });

    return logins;
}

(async () => {
    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
        await initSettings();
    } else {
        document.addEventListener('DOMContentLoaded', initSettings);
    }

    updateAvailableResponse(await browser.runtime.sendMessage({
        action: 'update_available_keepassxc'
    }));
})();
