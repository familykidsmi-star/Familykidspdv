# FamilyKids V13 Enterprise AI

Esta é a primeira versão **full-stack/cloud** do FamilyKids ERP, preparada para sair do HTML estático e virar um sistema profissional com API, login, permissões, IA, CRM, Studio, relatórios e auditoria.

## O que esta versão entrega

- Backend/API Node.js + Express.
- Primeiro acesso aberto para criar o proprietário.
- Login por usuário/e-mail e senha.
- Estrutura para Login Google real.
- Recuperação de senha por e-mail via SMTP.
- Controle de usuários, cargos e permissões.
- Produtos com exclusão segura: exclui somente sem histórico; arquiva quando já teve venda/movimentação.
- Movimentação de estoque por tamanho.
- PDV/vendas com baixa automática de estoque.
- CRM básico de clientes.
- Catálogo público paginado.
- Assistente de cliente no catálogo.
- FamilyKids AI Core: chat operacional, diagnóstico, rascunho de produto, descrição por IA, execução confirmada.
- FamilyKids Studio: lookbook/revista/seleção para WhatsApp.
- Relatórios: anomalias, Curva ABC, campeões de venda, reposição.
- Etiquetas/impressão: prévia de etiquetas com dados da loja.
- Auditoria completa das ações importantes.
- Frontend atual incluído em `frontend/index.html`.

## Como rodar no computador

1. Instale Node.js LTS.
2. Entre na pasta do backend:

```bash
cd backend
npm install
cp .env.example .env
npm start
```

3. Abra no navegador:

```text
http://localhost:3000
```

4. A API de saúde fica em:

```text
http://localhost:3000/api/health
```

## Primeiro acesso

O sistema começa sem proprietário. A primeira configuração deve chamar:

```http
POST /api/auth/setup-owner
```

com:

```json
{
  "name": "Ciro",
  "email": "seu-email-da-loja@exemplo.com",
  "username": "ciro",
  "password": "sua-senha-segura"
}
```

Depois disso, ninguém mais consegue criar proprietário por essa rota.

## Ativar IA real

No arquivo `backend/.env`, configure:

```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4o-mini
```

Sem a chave, o sistema usa um modo local inteligente, mas não faz raciocínio real com modelo externo.

## Ativar recuperação de senha por e-mail

Configure SMTP no `.env`:

```env
SMTP_HOST=smtp.seudominio.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=senha
SMTP_FROM="FamilyKids ERP <no-reply@seudominio.com>"
```

## Ativar Login Google

Configure:

```env
GOOGLE_CLIENT_ID=seu_client_id_google
```

O frontend ainda precisará receber o botão Google oficial com esse Client ID na etapa de deploy.

## Próximos passos recomendados

1. Subir esse backend em Render, Railway, Fly.io ou VPS.
2. Migrar `data/db.json` para PostgreSQL/Supabase.
3. Migrar imagens para Storage S3/Supabase Storage.
4. Conectar o frontend V12/V13 às rotas da API.
5. Ativar e-mail real, Google Login e IA real.
6. Implementar app PWA instalável.

## Importante

Este pacote já contém a base funcional do servidor/API. Para produção real, o próximo passo é deploy cloud e banco de dados profissional. O `db.json` serve para protótipo e testes iniciais.
