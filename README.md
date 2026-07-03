# Projeto de DevOps - Consultoria (Kubernetes / Minikube)

Esta é a versão da aplicação de consultoria preparada para rodar em um cluster
**Kubernetes**, usando o **Minikube** localmente. É uma evolução da versão com
Docker Compose: os mesmos containers (backend, frontend e banco) agora são
orquestrados pelo Kubernetes.

> **Requisito do trabalho:** *tudo* roda dentro do cluster, **inclusive o banco de
> dados**. Vale registrar que manter um banco stateful dentro do cluster não é a
> prática mais recomendada para produção (o usual seria um banco gerenciado/externo
> ou, no mínimo, um `StatefulSet` dedicado). Aqui ele roda dentro do cluster apenas
> para atender ao requisito da disciplina, usando um `Deployment` + volume persistente.

## Stack

- **Backend:** NestJS + TypeORM + JWT + AdminJS (porta 3000)
- **Frontend:** Next.js exportado como site estático, servido por **nginx**, que
  também faz proxy reverso de `/api`, `/socket.io` e `/admin` para o backend
- **Banco:** PostgreSQL 16, dentro do cluster, com volume persistente
- **Redis:** `redis:7-alpine`, usado como adapter do Socket.IO (broadcast de eventos
  em tempo real entre as réplicas do backend)
- **Orquestração:** Kubernetes (Minikube), exposto via **Ingress**

## Implantação

A implantação usa o chart **Helm no formato umbrella** (`k8s/consultoria/`), com
subcharts para `db`, `backend` e `frontend` — o mesmo formato usado nos exemplos
do professor. Detalhes do chart em `k8s/README.md`.

As imagens do backend e do frontend são publicadas no **Docker Hub**:

- https://hub.docker.com/r/lucasoliveiraalves/consultoria-backend
- https://hub.docker.com/r/lucasoliveiraalves/consultoria-frontend

A forma mais simples de subir tudo é com os scripts `helm-up` / `helm-down`
(ver abaixo). Há também um `Makefile` como alternativa.

## Pré-requisitos

- [Minikube](https://minikube.sigs.k8s.io/)
- `kubectl`
- Helm 3+
- Docker (driver do Minikube) — logado no Docker Hub (`docker login -u lucasoliveiraalves`)
- `make` (opcional)

## Arquitetura no cluster

```
                       Ingress (k8s.local)
                                  │
                                  ▼
                       Service: frontend (80)
                                  │
                       Pod frontend (nginx + site estático)
                          │  proxy /api, /socket.io, /admin
                                  ▼
                       Service: backend (3000)
                                  │
                       Pods backend (NestJS, N réplicas)
                          │                         │
                          ▼                         ▼
            Service: consultoria-db (5432)   Service: consultoria-redis (6379)
                          │                         │
       Pod Postgres ── PVC ── PV            Pod Redis (pub/sub do Socket.IO)
```

Apenas o frontend é exposto pelo Ingress. Backend e banco ficam acessíveis somente
dentro do cluster (Services do tipo `ClusterIP`), o que é o comportamento desejado.

## Estrutura do chart (`k8s/consultoria/`)

```
consultoria/
├── Chart.yaml              # chart pai (declara os 3 subcharts como dependências)
├── values.yaml             # valores globais + overrides de cada subchart
├── templates/
│   ├── configmap.yaml      # ConfigMap compartilhado (host do banco, porta, modo...)
│   ├── secret.yaml         # Secret compartilhado (credenciais do banco, JWT, e-mail)
│   └── ingress.yaml        # Ingress no host k8s.local
└── charts/
    ├── db/                 # Postgres: PV, PVC, Deployment (Recreate) e Service
    ├── redis/              # Redis: Deployment e Service (adapter do Socket.IO)
    ├── backend/            # NestJS: Deployment (initContainers wait-for-db/redis) e Service
    └── frontend/           # nginx: Deployment e Service
```

O `values.yaml` do chart pai tem um bloco `global` (compartilhado com todos os
subcharts e com o ConfigMap/Secret do pai) e os blocos `db`, `backend` e `frontend`,
repassados aos subcharts de mesmo nome.

## Como rodar (scripts)

```bash
# Login no Docker Hub (uma vez)
docker login -u lucasoliveiraalves

# Sobe tudo: -i inicia o minikube + ingress, -b builda/publica o backend,
# -f builda/publica o frontend. Por fim instala o chart via Helm.
./helm-up -ibf

# Configura o acesso pelo Ingress (uma vez)
echo "$(minikube ip)  k8s.local" | sudo tee -a /etc/hosts

# Acesse: http://k8s.local
```

Nas execuções seguintes, sem rebuildar imagens, basta `./helm-up`.
Para remover: `./helm-down`.

Os scripts fazem `docker build` + `docker push` (Docker Hub) + `minikube image load`
das imagens, e então `helm upgrade --install consultoria k8s/consultoria`.

## Como rodar (com Makefile)

```bash
make start      # minikube start + addon ingress
make push       # build + docker push + minikube image load das imagens
make deploy     # helm upgrade --install do chart umbrella
make hosts      # mostra a linha para o /etc/hosts

# atalhos
make up         # push + deploy
make redeploy   # rebuild/push + rollout restart
make status     # kubectl get pods,svc,ingress
make logs-backend
make logs-db
make down       # helm uninstall
```

## Acesso à aplicação

- Frontend: `http://k8s.local`
- Painel AdminJS: `http://k8s.local/admin` (`admin@example.com` / `password`)
- Usuários de exemplo (caso a base já tenha sido populada):
  - Cliente: `cliente@exemplo.com`
  - Consultor: `consultor@exemplo.com`
  - Senha: `teste123`

Você também pode criar um usuário novo pela tela de cadastro.

### Alternativa sem editar /etc/hosts

Se preferir não mexer no `/etc/hosts`, é possível acessar via port-forward:

```bash
kubectl port-forward service/frontend 8080:80
# acesse http://localhost:8080
```

## Persistência do banco

Os dados do Postgres ficam num `PersistentVolume` do tipo `hostPath`
(`/mnt/data/consultoria-db` dentro da VM do Minikube). Isso significa que os dados
sobrevivem a reinícios do pod. Para apagar tudo, basta remover o PVC/PV
(`make down` os remove) ou recriar o cluster (`minikube delete`).

## Verificação rápida

```bash
# Todos os pods devem ficar 1/1 Running
kubectl get pods

# Testar o frontend e o proxy da API via Ingress
IP=$(minikube ip)
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: k8s.local" http://$IP/
curl -s -H "Host: k8s.local" -H "Content-Type: application/json" \
  -X POST -d '{"email":"x@x.com","password":"y"}' http://$IP/api/auth/login
```

## Diferenças em relação à versão com Docker Compose

- O `compose.yaml` foi substituído pelo chart Helm em `k8s/`.
- O proxy do nginx aponta para o Service `backend` (antes era `nest-app`).
- A rede do Compose virou DNS interno de Services do Kubernetes.
- O volume do Compose virou `PersistentVolume` + `PersistentVolumeClaim`.
- A exposição via porta 80 do host virou um `Ingress`.
