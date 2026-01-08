# Frontier Ship Map Renderer – Renderer Backend

See the [main README](../README.md) for details.

This is the renderer backend that takes shuttle YAML files and renders them to an array of raw pixel data. In addition to the main export, `frontier-map-renderer-backend`, this package also contains a CLI that can be used for testing purposes. After building, it can be invoked like so:

```shell
$ node dist/cli.js --config config.yml --input ../path/to/shuttle.yaml --output my_cool_ship.png
```

`--config` is optional; if omitted, the tool uses [config.default.yml](./src/config.default.yml). `--output` is also optional and defaults to `map.png`.
