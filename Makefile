
DOCKERHUB_USER := lucasoliveiraalves
BACKEND_IMAGE  := $(DOCKERHUB_USER)/consultoria-backend:latest
FRONTEND_IMAGE := $(DOCKERHUB_USER)/consultoria-frontend:latest
HOST           := k8s.local

RELEASE        := consultoria
CHART          := ./k8s/consultoria

.PHONY: start build push deploy up down redeploy status logs-backend logs-db hosts open

start:
	minikube start
	minikube addons enable ingress

build:
	docker build -t $(BACKEND_IMAGE) ./back-consultoria
	docker build -t $(FRONTEND_IMAGE) ./front-consultoria

push: build
	docker push $(BACKEND_IMAGE)
	docker push $(FRONTEND_IMAGE)
	minikube image load $(BACKEND_IMAGE)
	minikube image load $(FRONTEND_IMAGE)

deploy:
	helm upgrade --install $(RELEASE) $(CHART)

up: push deploy

redeploy: push
	kubectl rollout restart deployment/backend deployment/frontend deployment/consultoria-db

down:
	-helm uninstall $(RELEASE)

status:
	kubectl get pods,svc,ingress

logs-backend:
	kubectl logs -l app=backend --tail=100 -f

logs-db:
	kubectl logs -l app=consultoria-db --tail=100 -f

hosts:
	@echo "Adicione a linha abaixo ao seu /etc/hosts:"
	@echo "$$(minikube ip)\t$(HOST)"

open:
	xdg-open http://$(HOST) >/dev/null 2>&1 || echo "Acesse http://$(HOST)"
