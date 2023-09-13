FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY main.js .
COPY jsconfig.json .

CMD ["bun", "run", "main.js"]

