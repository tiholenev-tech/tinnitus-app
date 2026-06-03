# Авто-деплой — еднократна настройка (после никога не я пипаш)

Workflow: `.github/workflows/deploy.yml`. При **merge/push в `main`** GitHub сам
SSH-ва в droplet-а и синхронизира `/var/www/auralis` до `origin/main`. Аудиото не
се пипа (rsync, отделно и рядко).

> След тази настройка не пускаш нищо ръчно. Само merge-ваш (или Claude merge-ва)
> и сайтът се обновява сам.

---

## Какво трябва ВЕДНЪЖ (≈5 мин)

### 1) Генерирай специален deploy ключ (на твоя компютър — Git Bash / PowerShell)
```bash
ssh-keygen -t ed25519 -f auralis_deploy -N "" -C "github-actions-deploy"
```
Прави два файла: `auralis_deploy` (ТАЕН) и `auralis_deploy.pub` (публичен).

### 2) Сложи ПУБЛИЧНИЯ ключ на droplet-а
```bash
ssh root@104.248.19.8 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys" < auralis_deploy.pub
```

### 3) Сложи секретите в GitHub
Repo → **Settings → Secrets and variables → Actions → New repository secret**.
Добави три:

| Име на secret | Стойност |
|---|---|
| `DROPLET_HOST` | `104.248.19.8` |
| `DROPLET_USER` | `root` |
| `DROPLET_SSH_KEY` | цялото съдържание на файла `auralis_deploy` (вкл. редовете `BEGIN`/`END`) |

Готово. Можеш да изтриеш локалния `auralis_deploy` — вече е в GitHub Secrets.

---

## Тест
GitHub → **Actions** → „Deploy to droplet (auralis)" → **Run workflow**
(или просто merge нещо в `main`). **Зелено = деплойнато.**
Червено *преди* да си сложил секретите е нормално (още няма ключ).

---

## Сигурност (важно)
Този ключ дава **root SSH** достъп до **споделен** сървър (RunMyStore/donela са на
същата машина). Пази секрета в GitHub. Workflow-ът чете потребителя от
`DROPLET_USER`, така че **по-късно** можеш да минеш на отделен `deploy` потребител,
ограничен само до `/var/www/auralis` — без да пипаш workflow-а, само сменяш секрета.

## Кога все пак има ръчна стъпка
Само когато се **сменят/добавят аудио файлове** (рядко) — те не са в git и се качват
с `rsync` (виж `DEPLOYMENT.md`). Кодовите промени (HTML/JS/CSS/PHP) са напълно авто.
