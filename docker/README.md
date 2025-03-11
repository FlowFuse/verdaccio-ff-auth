# FlowFuse NPM Registry Container

## Configure

Expects a Verdaccio configuration file mounting on `/verdaccio/conf/config.yaml`

e.g.

```yaml
storage: /verdaccio/storage
web:
    enable: false
auth:
    flowfuse-auth:
        baseURL: http://forge.default
        adminUser: admin
        adminSecret: secret
packages:
    '@*/*':
        access: $authenticated
log: { type: stdout, format: pretty, level: http }
```

And persistent volume should be mounted on `/verdaccio/storge`