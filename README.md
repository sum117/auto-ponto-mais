# auto-ponto-mais

Para instalar dependências:

```bash
bun install
```

To run:

```bash
bun run main.js
```

Esse projeto foi criado usando `bun init` no bun v1.0.1. [Bun](https://bun.sh) é um rápido runtime JavaScript all-in-one.

Se você quiser rodar sem docker compose, use esse comando:

```bash
docker build -t auto-ponto-mais . && docker run -d \
--restart always \
-e EMAIL=seu_email@example.com \
-e PASSWORD=sua_senha \
-e LATITUDE=xx.xxxx \
-e LONGITUDE=yy.yyyy \
-e ADDRESS="Seu Endereço Completo" \
nome_da_sua_imagem
```

Caso contrário, apenas preencha o arquivo .env.example e renomeie para .env:

```bash
cp .env.example .env
```

