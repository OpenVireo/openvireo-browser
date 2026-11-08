'use strict';

(async () => {
    await initColorTheme();

    $('#lock-database-button').show();

    const basicAuthLogins = await getLoginData(true);
    const ll = document.getElementById('login-list');

    for (const [ i, login ] of basicAuthLogins.loginList.entries()) {
        const a = createLoginRow(i, login.name || login.login, login.login, login.login + ' (' + login.name + ')');

        a.addEventListener('click', (e) => {
            if (!e.isTrusted) {
                return;
            }

            e.preventDefault();
            const credentials = basicAuthLogins.loginList[Number(e.currentTarget.id)];
            browser.runtime.sendMessage({
                action: 'fill_http_auth',
                args: credentials
            });

            close();
        });
        ll.appendChild(a);
    }

    $('#lock-database-button').addEventListener('click', function() {
        browser.runtime.sendMessage({
            action: 'lock_database'
        });

        $('.credentials').hide();
        $('#btn-dismiss').hide();
        $('#database-not-opened').show();
        $('#lock-database-button').hide();
        $('#database-error-message').textContent = tr('errorMessageDatabaseNotOpened');
    });

    $('#btn-dismiss').addEventListener('click', async () => {
        // Return empty credentials
        browser.runtime.sendMessage({
            action: 'fill_http_auth',
            args: { login: '', password: '' }
        });

        close();
    });
})();
