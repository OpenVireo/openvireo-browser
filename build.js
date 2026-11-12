#!/usr/bin/env node
'use strict';

const fs = require('@npmcli/fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const DEST = 'keepassxc-browser';
const DEFAULT = 'manifest_default.json';
const BROWSERS = {
    'Firefox': 'manifest_firefox.json',
    'Chromium': 'manifest_chromium.json',
};

const getVersion = async () => {
    const manifestFile = await fs.readFile(DEFAULT, { encoding: 'utf8' });
    const data = JSON.parse(manifestFile);
    return data['version'];
};

const setVersion = async (manifest, version) => {
    const manifestFile = await fs.readFile(manifest, { encoding: 'utf8' });
    const data = JSON.parse(manifestFile);

    data['version'] = version;
    if (Object.hasOwn(data, 'version_name')) {
        data['version_name'] = version;
    }
    await fs.writeFile(manifest, JSON.stringify(data, null, 4) + '\n');
};

// The manifest's "key" pins the extension ID for unpacked builds, and the stores reject it
const writeStoreManifest = async (source, destination) => {
    const data = JSON.parse(await fs.readFile(source, { encoding: 'utf8' }));
    delete data['key'];
    await fs.writeFile(destination, JSON.stringify(data, null, 4) + '\n');
};

const getParam = (params, name) => {
    const index = params.indexOf(name);
    return index >= 0 ? params[index + 1] : undefined;
};

const getDestinationFilename = async (manifest, version) => {
    const browser = manifest.substring(manifest.indexOf('_') + 1, manifest.indexOf('.'));
    return `openvireo-browser_${version}_${browser}.zip`;
};

const updateTranslations = async () => {
    console.log('Pulling translations from Transifex, please wait...');
    const { stdout } = await exec('tx pull -af');
    console.log(stdout);
};

const createZipFile = async (fileName, path) => {
    await exec(`cd ${path} && tar -a -cf ../${fileName} * && cd ..`);
};

(async() => {
    const params = process.argv.slice(2);
    if (!params.includes('--skip-translations')) {
        await updateTranslations();
    }

    await fs.copyFile(`${DEST}/manifest.json`, `./${DEFAULT}`);
    const version = await getVersion();

    for (const browser in BROWSERS) {
        console.log(`OpenVireo Browser: Creating extension package for ${browser}`);

        const fileName = await getDestinationFilename(BROWSERS[browser], version);
        await setVersion(`./dist/${BROWSERS[browser]}`, version);
        await writeStoreManifest(`./dist/${BROWSERS[browser]}`, `${DEST}/manifest.json`);

        if (await fs.exists(fileName)) {
            await fs.rm(fileName);
        }

        // The Chrome Web Store takes the extension ID from a key.pem at the zip root on an item's first upload
        const keyPem = browser === 'Chromium' ? getParam(params, '--key-pem') : undefined;
        if (keyPem) {
            await fs.copyFile(keyPem, `${DEST}/key.pem`);
        }
        try {
            await createZipFile(fileName, DEST);
        } finally {
            if (keyPem) {
                await fs.rm(`${DEST}/key.pem`, { force: true });
            }
        }
        console.log(keyPem ? 'Done (with key.pem, for the first Chrome Web Store upload only)' : 'Done');
    }

    fs.renameSync(DEFAULT, `${DEST}/manifest.json`);
})();
