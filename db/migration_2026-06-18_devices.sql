-- AURALIS — Migration 2026-06-18: anon-first flow (device entitlement) + grandfather.
-- ============================================================================
-- ⚠️ ADDITIVE миграция. НЕ променя смисъла на съществуващите таблици — само
-- добавя нови таблици/колони. Пусни ВЕДНЪЖ на сървъра при деплой:
--   mysql --defaults-file=/etc/mysql/debian.cnf auralis < db/migration_2026-06-18_devices.sql
--
-- 🛡️ ЗАЩИТА НА ЗАВАРЕНИ: този скрипт маркира ВСИЧКИ съществуващи users като
--    lifetime (виж най-долу). Анонимните заварени (без имейл) се хващат
--    клиент-side → api/device_init.php (claim в grace прозореца).
--
-- Idempotent (MariaDB: ADD COLUMN/CREATE IF NOT EXISTS) — безопасно при повтор,
-- НО UPDATE-ът за lifetime в края използва @cutoff = момента на пускане → пусни
-- скрипта ВЕДНЪЖ при деплой (повторно пускане няма да навреди на заварени, но
-- може да маркира lifetime устройства/хора, създадени между двете пускания).

SET NAMES utf8mb4;

-- ── users: флаг за „заварен завинаги" (имейл-акаунти) ───────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_lifetime TINYINT(1) NOT NULL DEFAULT 0;

-- ── devices: entitlement на ниво устройство (анонимни + claim на заварени) ───
CREATE TABLE IF NOT EXISTS devices (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_token     CHAR(64) NOT NULL UNIQUE,
  status           ENUM('trial','lifetime','paid') NOT NULL DEFAULT 'trial',
  trial_started_at DATETIME NULL,
  linked_user_id   BIGINT UNSIGNED NULL,
  trial_ip         VARCHAR(45) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at     DATETIME NULL,
  INDEX idx_trial_ip (trial_ip),
  INDEX idx_linked_user (linked_user_id),
  CONSTRAINT fk_devices_user FOREIGN KEY (linked_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── epay_payments: връзка към устройство (за анонимно EasyPay плащане) ───────
ALTER TABLE epay_payments
  ADD COLUMN IF NOT EXISTS device_token CHAR(64) NULL;

-- ── sent_reminders: idempotency за имейл напомнянията (ден 7/12/14) ──────────
CREATE TABLE IF NOT EXISTS sent_reminders (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id   BIGINT UNSIGNED NOT NULL,
  day       INT NOT NULL,
  sent_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_day (user_id, day),
  CONSTRAINT fk_reminder_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 🛡️ GRANDFATHER: всеки СЪЩЕСТВУВАЩ имейл-акаунт → lifetime завинаги ───────
-- @cutoff = моментът на пускане на миграцията. Всичко създадено преди него е
-- заварено (паунд преди paywall-а). Часовникът важи само за нови след деплой.
SET @cutoff = NOW();
UPDATE users SET is_lifetime = 1 WHERE created_at < @cutoff;
