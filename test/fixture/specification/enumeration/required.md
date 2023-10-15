# Environment Variables

This document describes the environment variables used by `<app>`.

Please note that **undefined** variables and **empty strings** are considered
equivalent.

The application may consume other undocumented environment variables; this
document only shows those variables defined using [Austenite].

[austenite]: https://github.com/ezzatron/austenite

## Index

- [`LOG_LEVEL`](#LOG_LEVEL) — the minimum log level to record

## Specification

### `LOG_LEVEL`

> the minimum log level to record

This variable **MUST** be set to one of the values below.
If left undefined the application will print usage information to `STDERR` then
exit with a non-zero exit code.

```sh
export LOG_LEVEL=debug # show information for developers
export LOG_LEVEL=info  # standard log messages
export LOG_LEVEL=warn  # important, but don't need individual human review
export LOG_LEVEL=error # a healthy application shouldn't produce any errors
export LOG_LEVEL=fatal # the application cannot proceed
```
