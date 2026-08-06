# Sistema de Gestão de Tarefas com Notificações

Aplicação web para gerenciamento de tarefas de equipes, com notificações em tempo real, desenvolvida como avaliação técnica (Dev Pleno/Sênior) para a Moovefy.

![Status](https://img.shields.io/badge/status-completo-brightgreen)

## 1. Descrição do Projeto

Um sistema onde equipes organizam **projetos** e as **tarefas** vinculadas a eles: criação, atribuição a responsáveis, acompanhamento de status (`Pendente → Em Andamento → Concluída`, com `Cancelada` como saída), prazos e prioridades. Ao atribuir ou reatribuir uma tarefa, o responsável recebe uma notificação em tempo real (SignalR). Um dashboard consolida métricas (tarefas por status, atrasadas, concluídas no prazo, taxa de conclusão).

O escopo implementado cobre **todos os requisitos obrigatórios** do enunciado (API REST completa, regras de negócio, frontend responsivo, Docker Compose) e a maior parte dos **diferenciais de nível Sênior**: autenticação JWT, notificações em tempo real via SignalR, testes unitários e de integração, cache em memória, logging estruturado, rate limiting e CI/CD.

## 2. Tecnologias Utilizadas

**Backend**
- .NET 8 / ASP.NET Core Web API, em Clean Architecture (Domain / Application / Infrastructure / API)
- Entity Framework Core 8 + Npgsql (PostgreSQL)
- FluentValidation, Serilog (console + arquivo), Swagger/OpenAPI (Swashbuckle)
- JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) + BCrypt.Net para hash de senha
- SignalR para notificações em tempo real
- `Microsoft.AspNetCore.RateLimiting` (nativo do .NET) e `IMemoryCache`
- xUnit, FluentAssertions, Moq, `Microsoft.AspNetCore.Mvc.Testing` (testes de integração com SQLite in-memory)

**Frontend**
- React 19 + TypeScript + Vite
- Redux Toolkit + RTK Query (estado global e cache de dados da API)
- React Router, React Hook Form + Zod (validação de formulários)
- Tailwind CSS v4, react-hot-toast, recharts (gráficos do dashboard)
- `@microsoft/signalr` (cliente do hub de notificações)

**Banco de dados:** PostgreSQL 16

**DevOps:** Docker + Docker Compose, GitHub Actions (CI: build, lint, testes, build das imagens)

## 3. Como Executar

### Pré-requisitos

- **Com Docker:** [Docker](https://www.docker.com/) e Docker Compose (v2, incluso no Docker Desktop)
- **Sem Docker:** [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0), [Node.js 20+](https://nodejs.org/), PostgreSQL 16 rodando localmente

### Rodando com Docker (recomendado)

Na raiz do repositório:

```bash
docker compose up --build
```

Isso sobe três containers: `postgres`, `backend` e `frontend`. O backend aplica as *migrations* e cria o usuário administrador automaticamente na primeira inicialização — não é preciso rodar nenhum comando manual de banco.

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000 (Swagger em http://localhost:5000/swagger)
- **PostgreSQL:** `localhost:5432` (`postgres` / `postgres`, banco `taskmanagement`)

Para parar: `docker compose down` (adicione `-v` para também apagar o volume do banco).

### Rodando sem Docker

**Banco de dados:** suba um PostgreSQL local (ou via `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine`) com um banco chamado `taskmanagement`.

**Backend:**

```bash
cd backend
dotnet restore
dotnet tool install --global dotnet-ef  # pule se já tiver a ferramenta instalada
dotnet ef database update --project src/TaskManagement.Infrastructure --startup-project src/TaskManagement.API
dotnet run --project src/TaskManagement.API
```

A API sobe em `http://localhost:5000` usando a connection string de `appsettings.json`, que já aponta para `localhost:5432` (ajuste se seu PostgreSQL local usar outra porta/usuário/senha).

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`, já configurado (`.env.development`) para consumir a API em `http://localhost:5000`.

### Credenciais padrão

Um usuário administrador é criado automaticamente (idempotente — só na primeira vez que o banco está vazio):

| Email | Senha |
|---|---|
| `admin@moovefy.com` | `Admin@123` |

Também é possível criar uma conta nova pela tela de registro.

### Portas

| Serviço | Porta (Docker) | Porta (sem Docker) |
|---|---|---|
| Frontend | 3000 | 5173 |
| API | 5000 | 5000 |
| PostgreSQL | 5432 | 5432 |

## 4. Decisões Técnicas

**Clean Architecture em 4 projetos** (Domain, Application, Infrastructure, API) em vez de uma arquitetura em camadas mais simples: o domínio (`Tarefa`, `Projeto`) concentra várias regras de negócio não triviais (fluxo de status, bloqueios de exclusão, cálculo de atraso). Isolar essas regras em entidades ricas, sem dependência de EF Core ou ASP.NET Core, torna-as testáveis com testes unitários puros (sem banco, sem HTTP) e protege contra regras de negócio "vazarem" para controllers ou para a camada de acesso a dados.

**Patterns aplicados:**
- **Repository + Unit of Work** (`Infrastructure/Persistence`): abstrai o EF Core do resto da aplicação e garante que operações que tocam múltiplas tabelas (ex.: criar tarefa + registrar notificação) usem uma única transação via `SaveChangesAsync`.
- **Strategy** (`IStatusTransitionStrategy` / `FluxoPadraoStatusTransitionStrategy`): a regra "Pendente → Em Andamento → Concluída" fica isolada numa política plugável, em vez de um `switch` espalhado pela entidade ou pelo service — facilita trocar/estender a regra (ex.: fluxos diferentes por tipo de projeto) sem tocar em `Tarefa`.

**Notificação de tarefa atrasada:** o enunciado pede que tarefas com prazo vencido sejam "sinalizadas automaticamente". Em vez de um *background job* varrendo o banco periodicamente (que exigiria uma lógica extra de deduplicação para não notificar a mesma tarefa a cada execução), optei por uma propriedade computada `Tarefa.IsAtrasada` — sempre correta, sem estado adicional, sem job. O frontend já mostra o indicador visual de atraso a partir dela em tempo real na consulta.

**Enums como string no JSON:** por padrão, o `System.Text.Json` serializa enums como número. Configurei `JsonStringEnumConverter` globalmente (ver `Program.cs`) para que a API troque `"Pendente"`, `"Alta"` etc. com o cliente — mais legível no Swagger e no payload, e é o que o frontend espera. Esse é exatamente o tipo de problema que só aparece testando a integração real (ver seção 5).

**Cache em memória no dashboard:** as métricas agregam todas as tarefas do banco a cada chamada; um `IMemoryCache` com TTL curto (2 min) evita recalcular a cada refresh do dashboard, e é invalidado sempre que uma tarefa ou projeto muda.

**Trade-off — sem Redis:** cache **in-memory** em vez de Redis. Para uma API com uma única instância (como esta), Redis adicionaria complexidade operacional sem benefício real; ficaria justificado se a API precisasse escalar horizontalmente com múltiplas réplicas compartilhando o cache.

**Trade-off — SQLite in-memory nos testes de integração:** os testes de integração substituem o PostgreSQL por SQLite in-memory (ver `CustomWebApplicationFactory`) para rodar sem depender de um container de banco. O risco é usar alguma feature específica do Npgsql que não exista no SQLite — mitigado por não usar tipos/recursos exclusivos do Postgres no modelo atual.

**Frontend — RTK Query em vez de `useEffect` + `fetch`:** cache automático por *tag*, invalidação declarativa (ex.: criar uma tarefa invalida a lista de tarefas e as métricas do dashboard) e estados de loading/erro prontos, sem precisar escrever esse controle manualmente em cada tela.

Ver também [`docs/architecture.md`](docs/architecture.md) para um diagrama da arquitetura e do fluxo de notificações.

## 5. Uso de IA no Desenvolvimento

**Sendo transparente:** usei [Claude Code](https://claude.com/claude-code) intensivamente como ferramenta de implementação — da estrutura das camadas aos componentes React — mas sob decisão e revisão minhas em cada etapa, e não como "gerar e copiar".

**Para que usei (boilerplate, geração de código, testes):**
- **Boilerplate e scaffolding:** criação da solução .NET, estrutura de projetos, configuração do Vite/Tailwind e migrations do EF Core.
- **Geração de código a partir de diretrizes:** implementação das camadas, entidades de domínio, services, controllers, componentes React e configurações de Docker e CI/CD.
- **Testes:** escrita dos 44 testes unitários e 15 de integração cobrindo as regras de negócio do enunciado, os quais revisei, executei e utilizei para validar o comportamento da aplicação.

**O que adaptei ou melhorei do código gerado:**
- **Identificação e correção de um bug real de integração:** depois de subir o ambiente via Docker Compose, executei chamadas HTTP reais contra os containers simulando requisições do frontend. Isso revelou que a API serializava enums (`Prioridade`, `StatusTarefa`) como inteiros, enquanto o frontend e o Swagger esperavam strings (`"Alta"`, `"Pendente"`). Os testes automatizados não pegaram esse ponto por usarem a mesma convenção default do .NET nos dois lados — só apareceu testando contra um payload JSON "cru", do jeito que o navegador realmente manda. Corrigi configurando o `JsonStringEnumConverter` globalmente e ajustando os testes de integração.
- **Métricas reais de cobertura:** aferi a cobertura com `coverlet` em vez de assumir um número — 80,1% no Domain e 57,0% no Application (~64,3% combinado nas regras de negócio), acima da meta de 50%.
- **Refino do domínio:** garanti que regras de negócio cruciais ficassem encapsuladas nas próprias entidades (`Tarefa.AlterarStatus`, `Tarefa.GarantirQuePodeSerExcluida`), em vez de espalhadas pelos services.
- **Decisões que assumo e defendo:** a stack (React + PostgreSQL), o nível de escopo Sênior (quais diferenciais entrar e quais postergar, com justificativa na seção "Melhorias Futuras"), a identidade visual a partir do logo da Moovefy, e as escolhas arquiteturais da seção 4 — Clean Architecture em 4 camadas, os patterns Strategy e Repository/Unit of Work, o trade-off de cache in-memory vs. Redis, e a sinalização de atraso como propriedade computada em vez de job em segundo plano.

## 6. Melhorias Futuras

Com mais tempo, eu:

- Adicionaria **testes de integração para o Hub SignalR** (hoje coberto só manualmente/pelo cliente do frontend).
- Implementaria **refresh token** (hoje o JWT expira em 2h e exige novo login).
- Adicionaria **Kubernetes manifests** (deployment/service/ingress) — ficou fora do escopo desta entrega por prioridade.
- Trocaria o cache in-memory por **Redis** se a API precisasse rodar em múltiplas réplicas.
- Adicionaria **paginação** na listagem de tarefas (hoje traz tudo de uma vez — ok para o volume de um teste técnico, não para produção em escala).
- Adicionaria um **background job leve** para, além da flag computada de atraso, também disparar uma notificação (não só o indicador visual) quando uma tarefa vence, com deduplicação por tarefa.
- Melhoraria a granularidade de autorização (hoje qualquer usuário autenticado pode editar qualquer tarefa/projeto — não há conceito de "membro do projeto" ou papéis).
- Adicionaria testes de acessibilidade/E2E (Playwright) no frontend.

## 7. Testes

**Rodar todos os testes (unitários + integração):**

```bash
cd backend
dotnet test TaskManagement.sln
```

**Rodar só os unitários** (regras de negócio do domínio + orquestração dos services, com Moq):

```bash
dotnet test tests/TaskManagement.UnitTests
```

**Rodar só os de integração** (sobem a API inteira em memória via `WebApplicationFactory`, com SQLite in-memory no lugar do Postgres — sem precisar de Docker):

```bash
dotnet test tests/TaskManagement.IntegrationTests
```

**Rodar com relatório de cobertura:**

```bash
dotnet test tests/TaskManagement.UnitTests --collect:"XPlat Code Coverage"
```

Gera um `coverage.cobertura.xml` em `TestResults/`, que pode ser visualizado com [ReportGenerator](https://github.com/danielpalme/ReportGenerator) ou aberto diretamente.

### Cobertura alcançada

| Camada | Cobertura de linhas |
|---|---|
| Domain (entidades e regras de negócio) | 80,1% |
| Application (services/casos de uso) | 57,0% |
| **Combinado (regras de negócio)** | **≈ 64,3%** |

Acima do mínimo de 50% pedido no enunciado para as regras de negócio. A camada Infrastructure (EF Core, JWT, SignalR) não é exercitada pelos testes unitários por design — é validada pelos 15 testes de integração, que sobem o pipeline HTTP completo.

**Resumo:** 44 testes unitários + 15 testes de integração, 59 no total, 0 falhas.

---

## Extras

- **Vídeo de demonstração:** _[adicionar link aqui]_
- **Screenshots:** _[adicionar link/imagens aqui]_
- **Diagrama de arquitetura:** [`docs/architecture.md`](docs/architecture.md) (Mermaid, renderiza direto no GitHub) e [`docs/architecture.drawio`](docs/architecture.drawio) (arquivo editável — abra em [draw.io](https://app.diagrams.net/))

---

## Estrutura do repositório

```
.
├── backend/                  # Solução .NET (Clean Architecture)
│   ├── src/
│   │   ├── TaskManagement.Domain/
│   │   ├── TaskManagement.Application/
│   │   ├── TaskManagement.Infrastructure/
│   │   └── TaskManagement.API/
│   └── tests/
│       ├── TaskManagement.UnitTests/
│       └── TaskManagement.IntegrationTests/
├── frontend/                 # React + TypeScript (Vite)
├── docs/
│   └── architecture.md       # Diagrama e detalhes de arquitetura
├── docker-compose.yml
└── .github/workflows/ci.yml
```
