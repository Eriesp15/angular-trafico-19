export const environment = {
  production: false,
  host: 'localhost:3700',
  port: location.protocol.replace(':', '') == 'https' ? '443' : '80',
  protocol: location.protocol,
};
