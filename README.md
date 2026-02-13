# Marketing Digital Top - Estrutura Base

Projeto Next.js para vender 1 produto agora (`/ansiedade`) e escalar para vários depois, com webhook Cakto e área de membros.

## Stack

- Next.js (App Router)
- Tailwind CSS
- Framer Motion
- Prisma + PostgreSQL
- Auth por cookie JWT + fluxo de `definir senha`
- Resend (com fallback de log em desenvolvimento)

## Rotas implementadas

- Landing: `/ansiedade`
- Checkout Cakto: `NEXT_PUBLIC_CAKTO_CHECKOUT_URL`
- Obrigado: `/obrigado/ansiedade`
- Login: `/login`
- Definir senha: `/definir-senha`
- Área de membros:
  - `/app`
  - `/app/produtos/[slug]`
  - `/app/conta`
  - `/app/suporte`
- Webhook Cakto: `/api/webhooks/cakto`
- PDF protegido (membros): `/api/members/ebooks/[slug]`

## Setup

1. Instale dependências:
```bash
npm install
```

2. Copie variáveis:
```bash
cp .env.example .env
```

3. Gere cliente Prisma:
```bash
npx prisma generate
```

4. Crie/migre banco:
```bash
npx prisma migrate dev --name init
```

5. Rode:
```bash
npm run dev
```

## Webhook Cakto

O endpoint valida:

- `payload.secret === CAKTO_WEBHOOK_SECRET`
- idempotência por `webhook_events.cakto_event_id` único

Eventos tratados:

- `purchase_approved`: cria/encontra usuário, ativa compra, gera token de senha e envia e-mail
- `refund` / `chargeback`: revoga compra no banco

## Testar integração em localhost (sem venda real)

Com o app rodando em `http://localhost:3000`, dispare um evento de compra de teste:

```bash
curl -X POST http://localhost:3000/api/dev/cakto/purchase \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"seuemail@teste.com\",\"name\":\"Seu Nome\"}"
```

Esse endpoint de desenvolvimento executa o mesmo fluxo do webhook:
- cria/atualiza usuário
- ativa compra
- gera link de `definir-senha`

O retorno JSON inclui `setupUrl` para você abrir e criar a senha.

Rota de teste disponível apenas fora de produção.

## Ebook PDF na área de membros (protegido)

Configure no `.env`:

- `ANSIEDADE_PDF_FILE_PATH` (ex.: `assets/ansiedade.pdf`)
- `NEXT_PUBLIC_ANSIEDADE_BONUS1_URL`
- `NEXT_PUBLIC_ANSIEDADE_BONUS2_URL`
- `NEXT_PUBLIC_ANSIEDADE_BONUS3_URL`

A página `/app/produtos/ansiedade` mostra:
- leitor embutido do PDF
- acesso do PDF apenas para usuário logado com compra ativa
- checklist de módulos com progresso visual

## Escala para novos produtos

- Cadastre novo item em `products` com `slug` e `cakto_product_id`
- Reuse layout da landing com nova copy/capa/checkout URL
- O webhook já está preparado para mapear produto por `payload.data.product.id`

## Observação importante

O conteúdo é educacional e de apoio prático. Não substitui acompanhamento profissional de saúde mental.
