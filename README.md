# auto-ponto-mais

Para instalar dependências:

```bash
bun install
```

Para rodar:

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
-e IP_ADDRESS="" \
auto-ponto-mais
```

Ou simplesmente use o repositório remoto da imagem docker:

```bash
docker run -d \
--restart always \
-e EMAIL=seu_email@example.com \
-e PASSWORD=sua_senha \
-e LATITUDE=xx.xxxx \
-e LONGITUDE=yy.yyyy \
-e ADDRESS="Seu Endereço Completo" \
# cheque o seu IP em: https://ipinfo.io/
-e IP_ADDRESS="" \
sum117/auto-ponto-mais
```

Caso contrário, apenas preencha o arquivo .env.example e renomeie para .env:

```bash
cp .env.example .env
```
Para finalmente rodar:

```bash
docker-compose up -d
```

