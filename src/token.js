const fs = require('fs');
const findUp = require('find-up');
const { log } = require('./logger');

async function findToken(logMeta) {
  const tokenFile = await findUp('.gitAccessToken');
  if (tokenFile) {
    if (process.env.RUNINSTALL_DEBUG) {
      log({
        ...logMeta,
        message: `Runinstall: Found token file at ${tokenFile}`,
      })
    }
    const token = fs.readFileSync(tokenFile, { encoding: 'utf-8'}).replace(/\n$/, '').trim();
    return token;
  } else if (process.env.RUNINSTALL_DEBUG) {
    log({
      ...logMeta,
      message: `Runinstall: Found no token file`,
    })
  }
  return null;
}

module.exports = {
  findToken,
}