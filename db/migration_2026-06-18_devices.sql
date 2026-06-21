-- AURALIS — Migration 2026-06-18: anon-first flow (device entitlement) + grandfather.
-- ============================================================================
-- ⚠️ ADDITIVE миграция. НЕ променя смисъла на съществуващите таблици — само
-- добавя нови таблици/колони. Пусни ВЕДНЪЖ на сървъра при деплой:
--   mysql --defaults-file=/etc/mysql/debian.cnf auralis < db/migration_2026-06-18_devices.sql
--
-- 🛡️ ЗАЩИТА НА ЗАВАРЕНИ: маркира ВСИЧКИ съществуващи users като lifetime (долу).
--    Анонимните заварени (без имейл) се хващат клиент-side → api/device_init.php.
--
-- СЪВМЕСТИМОСТ: работи и на MySQL (Oracle), и на MariaDB. НЕ ползва
-- `ADD COLUMN IF NOT EXISTS` (това е само MariaDB) — вместо това проверява
-- information_schema + PREPARE, за да е idempotent на ДВАТА engine-а.

SET NAMES utf8mb4;

-- ── users.is_lifetime (добави само ако липсва) ──────────────────────────────
SET @need := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_lifetime');
SET @sql := IF(@need,
  'ALTER TABLE users ADD COLUMN is_lifetime TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

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

-- ── epay_payments.device_token (добави само ако липсва) ─────────────────────
SET @need := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'epay_payments' AND COLUMN_NAME = 'device_token');
SET @sql := IF(@need,
  'ALTER TABLE epay_payments ADD COLUMN device_token CHAR(64) NULL',
  'SELECT 1');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

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
-- @cutoff = моментът на пускане. Всичко създадено преди него е заварено.
SET @cutoff = NOW();
UPDATE users SET is_lifetime = 1 WHERE created_at < @cutoff;
