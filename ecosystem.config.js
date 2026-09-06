module.exports = {
  apps: [
    {
      name: 'essential',
      script: 'dist/apps/services/essential/main.js',
      instances: 5,
      exec_mode: 'cluster',
      // The same V8 ceiling `scripts/start.js` gives the container, and for the same reason: with no
      // flag V8 sizes old-space from the host's RAM and simply collects late, so an instance sits on
      // gigabytes it does not need (measured: 2 916 MB on the instance taking direct load, against
      // ~270 MB on its four idle siblings). Capping it also turns a real leak into a fast, legible
      // death instead of hours of bloat — keep it under the box's per-instance share.
      node_args: '--max-old-space-size=2048',
      env: { SERVICE_NAME: 'essential' },
    },
  ],
};
