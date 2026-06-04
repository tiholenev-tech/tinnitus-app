-- AURALIS — MySQL схема (Фаза 1: login + cloud sync)
-- Пусни веднъж на сървъра:  mysql -u auralis -p auralis < db/schema.sql
-- Idempotent (CREATE TABLE IF NOT EXISTS) — безопасно при повторно пускане.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email            VARCHAR(255) NOT NULL UNIQUE,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trial_started_at DATETIME NULL,
  paid             TINYINT(1) NOT NULL DEFAULT 0,
  paid_at          DATETIME NULL,
  last_seen_at     DATETIME NULL,
  trial_ip         VARCHAR(45) NULL,
  INDEX idx_trial_ip (trial_ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Magic link токени (пазим само sha256 хеш, не суровия токен)
CREATE TABLE IF NOT EXISTS magic_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  token_hash  CHAR(64) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  ip          VARCHAR(45) NULL,
  INDEX idx_email (email),
  INDEX idx_hash (token_hash),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Сесии (пазим само sha256 хеш на session токена)
CREATE TABLE IF NOT EXISTS sessions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  session_hash  CHAR(64) NOT NULL UNIQUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME NOT NULL,
  ip            VARCHAR(45) NULL,
  INDEX idx_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cloud sync: цялото състояние на потребителя като JSON (profiles/favorites/
-- pitch/thi/diary/streak — клиентът решава какво праща). Last-write-wins + rev.
CREATE TABLE IF NOT EXISTS user_state (
  user_id     BIGINT UNSIGNED PRIMARY KEY,
  data        MEDIUMTEXT NOT NULL,
  rev         INT UNSIGNED NOT NULL DEFAULT 1,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_state_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ePay.bg / EasyPay плащания (invoice → user mapping за notify)
CREATE TABLE IF NOT EXISTS epay_payments (
  invoice     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  amount      VARCHAR(16) NOT NULL,
  currency    VARCHAR(8) NOT NULL DEFAULT 'EUR',
  status      VARCHAR(16) NOT NULL DEFAULT 'pending',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at     DATETIME NULL,
  INDEX idx_user (user_id),
  CONSTRAINT fk_epay_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4;
