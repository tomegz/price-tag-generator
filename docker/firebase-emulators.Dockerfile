FROM node:24-trixie-slim

ARG FIREBASE_TOOLS_VERSION=15.17.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openjdk-21-jre-headless \
  && rm -rf /var/lib/apt/lists/*

RUN npm install --global firebase-tools@${FIREBASE_TOOLS_VERSION}

WORKDIR /workspace

EXPOSE 4000 9000 9099

CMD ["sh", "-c", "firebase --project demo-price-tag-generator --config firebase.docker.json emulators:start --import=/workspace/${FIREBASE_EMULATOR_EXPORT_DIR:-emulator-data} --export-on-exit=/workspace/${FIREBASE_EMULATOR_EXPORT_DIR:-emulator-data}"]
