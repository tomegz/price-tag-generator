function readPort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Firebase rules test database emulator port must be a positive integer.');
  }
  return port;
}

function parseHostAndPort(value) {
  const hostAndPort = value.replace(/^https?:\/\//, '');
  const separatorIndex = hostAndPort.lastIndexOf(':');

  if (separatorIndex <= 0 || separatorIndex === hostAndPort.length - 1) {
    throw new Error('FIREBASE_DATABASE_EMULATOR_HOST must use host:port format.');
  }

  return {
    host: hostAndPort.slice(0, separatorIndex),
    port: readPort(hostAndPort.slice(separatorIndex + 1))
  };
}

export function readRulesDatabaseEmulatorConfig(env = process.env) {
  if (env.FIREBASE_DATABASE_EMULATOR_HOST) {
    return parseHostAndPort(env.FIREBASE_DATABASE_EMULATOR_HOST);
  }

  return {
    host: env.FIREBASE_RULES_DATABASE_EMULATOR_HOST || '127.0.0.1',
    port: readPort(env.FIREBASE_RULES_DATABASE_EMULATOR_PORT || '9000')
  };
}
