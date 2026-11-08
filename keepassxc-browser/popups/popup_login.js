'use strict';

(async () => {
    await initColorTheme();

    $('#lock-database-button').show();

    const tab = await getCurrentTab();
    if (!tab) {
        return [];
    }

    const logins = await getLoginData();
    const ll = document.getElementById('login-list');

    for (const [ i, login ] of logins.entries()) {
        const uuid = login.uuid;
        const a = login.title !== undefined
            ? createLoginRow(i, login.title, login.login, login.text)
            : createLoginRow(i, login.text, '', login.text);

        a.addEventListener('click', (e) => {
            if (!e.isTrusted) {
                return;
            }

            e.preventDefault();
            const id = e.currentTarget.id;
            browser.tabs.sendMessage(tab?.id, {
                action: 'fill_user_pass_with_specific_login',
                id: Number(id),
                uuid: uuid
            });

            close();
        });

        ll.appendChild(a);
    }

    if (logins.length > 1) {
        $('#filter-block').show();
        const filter = document.getElementById('login-filter');
        filter.addEventListener('input', (e) => {
            if (!e.isTrusted) {
                return;
            }

            filterLoginRows(ll, filter.value);
        });

        // Enter fills the first visible match.
        filter.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const first = [ ...ll.querySelectorAll('a.login-row') ].find(r => r.style.display !== 'none');
                first?.click();
            }
        });

        filter.focus();
    }

    $('#lock-database-button').addEventListener('click', (e) => {
        browser.runtime.sendMessage({
            action: 'lock_database'
        });

        $('#credentialsList').hide();
        $('#database-not-opened').show();
        $('#lock-database-button').hide();
        $('#database-error-message').textContent = tr('errorMessageDatabaseNotOpened');
    });

    $('#reopen-database-button').addEventListener('click', (e) => {
        browser.runtime.sendMessage({
            action: 'get_status',
            args: [ false, true ] // Set forcePopup to true
        });
    });
})();
