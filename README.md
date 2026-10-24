# OpenVireo Browser

Browser extension for [OpenVireo](https://openvireo.com/) with [native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging).

OpenVireo Browser is a fork of [KeePassXC-Browser](https://github.com/keepassxreboot/keepassxc-browser), and OpenVireo is a fork of [KeePassXC](https://keepassxc.org/). It is not affiliated with or endorsed by the KeePassXC Team.

## Download and use

Use it with the latest OpenVireo desktop release. Store listings for Firefox, Chrome/Chromium and Microsoft Edge are not published yet; until then, load the extension unpacked (see [Development and testing](#development-and-testing)).

Please see this [document](https://openvireo.com/docs/OpenVireo_GettingStarted.html#_browser_integration) for instructions how to configure OpenVireo in order to connect the database correctly.

## How it works

OpenVireo Browser communicates with OpenVireo through _openvireo-proxy_, registered as the native messaging host `com.openvireo.browser`. The proxy handles listening to STDIN/STDOUT
and transfers these messages through Unix domain sockets / named pipes to OpenVireo. This means OpenVireo can be used and started normally without interference from
Native Messaging API. OpenVireo Browser starts only the proxy application and there's no risk of shutting down OpenVireo or losing any unsaved changes. You don't need to install openvireo-proxy separately. It is included in the OpenVireo application package.

## Requested permissions

OpenVireo Browser extension requests the following permissions:

| Name  | Reason |
| ----- | ----- |
| `activeTab`               | To get URL of the current tab |
| `contextMenus`            | To show context menu items |
| `cookies`                 | To access browser's internal Public Suffix List |
| `clipboardWrite`          | Allows password to be copied from password generator to clipboard |
| `nativeMessaging`         | Allows communication with OpenVireo application |
| `notifications`           | To show browser notifications |
| `offscreen`               | For accessing system theme when setting icon colors (Chrome only) |
| `privacy`                 | For setting the extension as default password manager |
| `storage`                 | For storing extension settings (always stored locally in the browser, they are never synced) |
| `tabs`                    | To request tab URL's and other info |
| `webNavigation`           | To show browser notifications on install or update |
| `webRequest`              | For handling HTTP Basic Auth |
| `webRequestAuthProvider`  | For handling HTTP Basic Auth for Chromium based browsers |
| `webRequestBlocking`      | For handling HTTP Basic Auth |
| `http://*/*`              | To allow using OpenVireo Browser on all websites |
| `https://*/*`             | To allow using OpenVireo Browser on all websites |
| `https://api.github.com/` | For checking the latest OpenVireo version from GitHub |

## Protocol

Check [keepassxc-protocol](keepassxc-protocol.md) for the details about the messaging protocol used between the browser extension and OpenVireo.

## Translations

The translations come from the upstream KeePassXC-Browser project on [Transifex](https://explore.transifex.com/keepassxc/keepassxc-browser/), rebranded for OpenVireo. Build with `npm run build -- --skip-translations`: a plain `npm run build` runs `tx pull`, which would overwrite the rebranded strings with upstream ones.

## Contributing

You may directly contribute your own code by submitting a pull request. Please read the [CONTRIBUTING](.github/CONTRIBUTING.md) document for further information.

## Development and testing

See [wiki](https://github.com/openvireo/openvireo-browser/wiki/Loading-the-extension-manually).

## Help!

See our [Troubleshooting Guide](https://github.com/openvireo/openvireo-browser/wiki/Troubleshooting-guide) for solving problems if previously listed issues and solutions are not working.
