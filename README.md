# Price tag generator
Personal project to automate the most repetitive task in ~~every retail store~~ a bike shop - printing price tags. It's used for printing price tags to be put on bike's handlebar [in this format][1]. [Here's the css][2].
# Tech stack
* React
* Firebase
* LocalStorage
* pnpm

# Local development

Local development uses Firebase emulators so testing does not write to production.

## Docker emulator path

Use this path if you do not want to install Java locally. Docker runs the Firebase Auth and Realtime Database emulators, while Vite runs on your host machine.

```bash
pnpm install
pnpm emulators:docker:build
pnpm emulators:seed
pnpm emulators:docker
```

In a second terminal:

```bash
pnpm dev
```

Then open:

```text
http://localhost:5173/price-tag-generator/
```

Seeded local login:

```text
owner@example.test
password123
```

Emulator UI:

```text
http://localhost:4000
```

## Native emulator path

This path requires a local JDK because the Realtime Database emulator runs on Java.

```bash
pnpm emulators:seed
pnpm emulators:start
```

# End-to-end tests

The Playwright suite owns a separate Docker emulator instance and deterministic seed data.

Install the Chromium browser once:

```bash
pnpm test:e2e:install
```

Run the suite:

```bash
pnpm test:e2e
```

# License
* This project is licensed under the MIT License.

[1]: https://github.com/tomegz/price-tag-generator/blob/master/example.pdf
[2]: https://github.com/tomegz/price-tag-generator/blob/master/src/styles/PrintTag.css
