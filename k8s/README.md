# Versão Helm — Umbrella + Subcharts

Esta é a versão em **Helm** no formato **guarda-chuva (umbrella)**, igual ao que o
professor usa no `cidades-chart`: um chart principal com três subcharts
(`db`, `backend`, `frontend`).

```
consultoria/
├── Chart.yaml              # chart pai, declara os 3 subcharts como dependências
├── values.yaml             # valores globais + overrides de cada subchart
├── templates/
│   ├── configmap.yaml      # ConfigMap compartilhado (parent)
│   ├── secret.yaml         # Secret compartilhado (parent)
│   └── ingress.yaml
└── charts/
    ├── db/                 # Postgres: Chart.yaml, values.yaml, templates/
    ├── backend/            # NestJS:   Chart.yaml, values.yaml, templates/
    └── frontend/           # nginx:    Chart.yaml, values.yaml, templates/
```

**Ideia central:** o `values.yaml` do pai tem um bloco `global` (compartilhado com
todos os subcharts e com os templates do pai) e os blocos `db`, `backend` e
`frontend`, que são repassados aos subcharts de mesmo nome. O ConfigMap e o Secret
ficam no chart pai (uma única fonte de verdade) e são referenciados por todos.

## Pré-requisitos

- Minikube com ingress habilitado e as imagens publicadas no Docker Hub
  (`lucasoliveiraalves/consultoria-backend` e `-frontend`). Ver o README principal
  (`./helm-up -ibf` ou `make push`).
- Helm 3+.

## Como usar

```bash
cd k8s

# valida e renderiza (opcional)
helm lint ./consultoria
helm template consultoria ./consultoria

# instala (o nome do release "consultoria" define o nome do banco: consultoria-db)
helm install consultoria ./consultoria

# acompanha
kubectl get pods,svc,ingress

# /etc/hosts -> http://k8s.local
echo "$(minikube ip)  k8s.local" | sudo tee -a /etc/hosts
```

> A partir da raiz do projeto, o caminho do chart é `./k8s/consultoria`.
> O `Makefile` na raiz já cuida disso (`make deploy`).

Atualizar após mudar valores/imagens:

```bash
helm upgrade consultoria ./consultoria
```

Remover:

```bash
helm uninstall consultoria
```

> **Importante:** o nome do release vira o prefixo de vários recursos
> (`<release>-db`, `<release>-config`, `<release>-secret`). O host do Ingress é
> fixo em `k8s.local`. Use `consultoria` como nome do release.

## Customização (exemplos)

```bash
# trocar a tag das imagens
helm install consultoria ./consultoria \
  --set backend.image.tag=v2 --set frontend.image.tag=v2

# mais réplicas de backend
helm install consultoria ./consultoria --set backend.replicaCount=2
```
