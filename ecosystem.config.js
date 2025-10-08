module.exports = {
  apps: [
    {
      name: 'essential',
      script: 'dist/apps/services/essential/main.js',
      instances: 5,
      exec_mode: 'cluster',
      env: { SERVICE_NAME: 'essential' },
    },
  ],
};
