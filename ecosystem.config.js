// ecosystem.config.js
// Inicializar: pm2 start ecosystem.config.js
// Monitorar:   pm2 monit
// Logs:        pm2 logs

module.exports = {
  apps: [
    {
      // Servidor principal da API
      name: "jlemara-api",
      script: "dist/src/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      // Workers ETL ERP (customer, obra, unidade) — agendados via node-cron interno
      name: "jlemara-etl",
      script: "dist/src/Workers/run.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
