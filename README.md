# verdaccio-flowfuse-auth

> Custom FlowFuse Authentication

---

## configuration

```
auth:
  flowfuse-auth:
    baseURL: https://forge.example.com
    adminSecret: password
packages:
  '@*/*':
    access: $authenticated
```

Where

- `baseURL` is the URL of the FlowFuse installation
- `adminSecret` is the "admin" users password. This user has access to all scopes.

## development

See the [verdaccio contributing guide](https://github.com/verdaccio/verdaccio/blob/master/CONTRIBUTING.md) for instructions setting up your development environment.
Once you have completed that, use the following npm tasks.

- `npm run build`

  Build a distributable archive

- `npm run test`

  Run unit test

For more information about any of these commands run `npm run ${task} -- --help`.

## docker container

`docker build -f docker/Dockerfile -t flowfuse/flowfuse-npm-registry .`
