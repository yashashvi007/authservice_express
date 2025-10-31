const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const certsDir = 'certs';
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
});

console.log('Public key:', publicKey);
console.log('Private key:', privateKey);

fs.writeFileSync(path.join(certsDir, 'public.pem'), publicKey);
fs.writeFileSync(path.join(certsDir, 'private.pem'), privateKey);
