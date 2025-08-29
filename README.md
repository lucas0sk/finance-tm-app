# Finance TM — Frontend (Angular)

Aplicação web do desafio **Finance TM** (Tokio Marine).
Front em **Angular 18 (standalone)**, **Bootstrap** (somente CSS) e integração REST com o backend Spring Boot.

---

## Stack & requisitos
- **Angular 18** (standalone components)
- **Typescript** / **RxJS**
- **Bootstrap 5** (apenas CSS)
- Node **>= 18** (LTS recomendado)
- Backend esperado em `http://localhost:8080` (Spring Boot + JWT)

---

## Rodando em desenvolvimento

1) Instale dependências:
```bash
npm i
```

2) Scripts no `package.json`:
```json
{
  "scripts": {
    "start": "ng serve -o --proxy-config proxy.conf.json --no-ssr",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "serve:prod": "npx serve -s dist/finance-tm-web"
  }
}
```

3) Suba o app:
```bash
npm start
```
Acesse em `http://localhost:4200/`.

> O projeto é **SSR-safe** (protege `localStorage` e usa `withFetch()`), mas em dev rodamos com `--no-ssr` para simplificar.

---

## Configuração de ambiente

`src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiBaseUrl: '/api'
};
```

---

## Contratos de API

### Auth
- `POST /api/auth/register`  
  **Body**:
  ```json
  { "fullName": "...", "cpf": "99999999999", "email": "...", "username": "...", "password": "..." }
  ```
  **200**:  
  ```json
  { "accessToken": "jwt...", "accountNumber": "1234567890" }
  ```

- `POST /api/auth/login`  
  **Body**:
  ```json
  { "username": "...", "password": "..." }
  ```
  **200**:  
  ```json
  { "accessToken": "jwt...", "accountNumber": "1234567890" }
  ```

### Conta
- `GET /api/accounts/me` → **200**:
  ```json
  { "accountNumber": "1234567890", "balance": 1000.00 }
  ```

### Transferências
- `POST /api/transfers/schedule`  
  **Headers**: `Authorization: Bearer <token>`, `X-Idempotency-Key: <uuid>` (enviado automaticamente pelo interceptor)  
  **Body**:
  ```json
  {
    "requestId": "uuid",
    "fromAccount": "1234567890",
    "toAccount": "0987654321",
    "amount": 150.00,
    "transferDate": "2025-08-29"
  }
  ```
  **201/200**: `TransferResponse` (exemplo):
  ```json
  {
    "requestId": "uuid",
    "fromAccount": "******7890",
    "toAccount": "0987654321",
    "amount": 150.00,
    "scheduledDate": "2025-08-28",
    "transferDate": "2025-08-29",
    "feeFixed": 3.00,
    "feePercent": 2.50,
    "feeAmount": 6.75,
    "totalAmount": 156.75,
    "status": "SUCCESS",
    "createdAt": "2025-08-28T12:34:56Z"
  }
  ```

- `GET /api/transfers/user/extract?status=&startDate=&endDate=&page=&size=&sort=createdAt,desc`  
  **200**: `Page<TransferResponse>`.

> **Status possíveis**: `PENDING | SUCCESS | FAILED`.

---

## Arquitetura de pastas

```
src/app
├─ app.config.ts                       # provideRouter + provideHttpClient(withFetch, interceptors)
├─ core
│  ├─ interceptors/jwt.interceptor.ts  # Authorization + X-Idempotency-Key + handle 401
│  ├─ guards/auth.guard.ts             # bloqueia rotas protegidas
│  ├─ services/auth.service.ts         # login/register, sessão SSR-safe
│  └─ models
│     ├─ common.ts                     # Page<T>
│     ├─ dto/{request.ts,response.ts}  # contratos com a API
│     └─ domain/enums.ts               # UserRole, UserStatus, TransferStatus
├─ features
│  ├─ auth/{login.component.ts, register.component.ts}
│  ├─ dashboard/{dashboard.component.*}
│  └─ transfer
│     ├─ transfer.component.*          # form + extrato
│     └─ services/{transfer.service.ts, account.service.ts}
└─ shared/ui/topbar.component.*        # barra de navegação
```

---

## Segurança & Boas práticas

- **JWT** no `Authorization: Bearer` via **interceptor**; logout em `401`.
- **Idempotência**: header `X-Idempotency-Key` (UUID) em toda requisição (o back é idempotente no agendamento).
- **SSR-safe**: `AuthService` só acessa `localStorage` no browser; `provideHttpClient(withFetch())`.
- **Validação no front**: pattern de 10 dígitos para contas, valor `> 0`, data `>= hoje` (além das validações do backend).
- **Acessibilidade**: mensagens com `aria-live` e feedback de erro visível.
- **Segurança de dados**: números de conta mascarados no back para quem não é o dono; o front respeita exibição conforme resposta.
- **CORS**

---

## Erros comuns (FAQ)

**CORS / “Failed to fetch” / preflight 401**  
→ Use o **proxy** em dev (`/api` → `http://localhost:8080`) ou habilite CORS e libere `OPTIONS` no backend.

**`localStorage is not defined`**  
→ Código SSR-safe já incluso (só acessa storage no browser). Em dev, rodamos com `--no-ssr`.

**403 `insufficient_scope`**  
→ Mapeie `scope` do JWT para autoridades sem `SCOPE_` no backend (converter) ou ajuste as anotações. O projeto supõe `ROLE_USER`/`ROLE_ADMIN`.

**`HttpClientModule is deprecated`**  
→ Usamos `provideHttpClient(withInterceptors(...), withFetch())` no `app.config.ts`.

---

## Fluxos cobertos

- **Cadastro**: cria usuário + conta; salva token e número da conta; redireciona para o Dashboard.
- **Login**: autentica; salva token e número da conta; guarda sessão no `localStorage`.
- **Dashboard**: exibe **conta**, **saldo** (`/accounts/me`) e **últimas transferências** (paginadas).
- **Transferência**: formulário com validação; cria `requestId` (UUID);
  - **Quem envia** paga **`totalAmount = amount + feeAmount`**.
  - **Quem recebe** vê **`amount`** como valor creditado.
  Extrato mostra KPI com o que impacta o usuário e linha-resumo **Valor / Taxas / Total**.

---

## Testes manuais rápidos

1. **Register** Usuário A e B (ou crie no back).
2. **Login** A → ver `tm.jwt` e `tm.account` no `localStorage`.
3. **Dashboard** → saldo e extrato carregam.
4. **Transferir** A → B (hoje ou futuro) → ver item no extrato.
5. **Idempotência**: repetir submit com o **mesmo** `requestId` → não duplica.
6. **Autorização**: `GET /api/transfers` (admin) como USER → 403.
7. **401**: limpar token e tentar rota protegida → redireciona para `/login`.

---

## Licença
Projeto de avaliação técnica — uso acadêmico/demonstração.
