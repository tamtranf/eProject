module.exports = {
  apps: [{
    name: 'e-project',
    script: 'bin/www',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1048 ',
    env: {
    },
  }],
};
