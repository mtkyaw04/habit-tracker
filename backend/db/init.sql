-- Habit Tracker schema
-- Runs automatically on first MySQL container start (mounted into /docker-entrypoint-initdb.d)

CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(36) PRIMARY KEY,
  username     VARCHAR(100) NOT NULL,
  email        VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar       VARCHAR(16) NOT NULL DEFAULT '🌸',
  theme        ENUM('light','dark') NOT NULL DEFAULT 'light',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS habits (
  id           VARCHAR(36) PRIMARY KEY,
  user_id      VARCHAR(36) NOT NULL,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  category     VARCHAR(100) NOT NULL,
  frequency    ENUM('daily','weekly') NOT NULL DEFAULT 'daily',
  week_days    JSON NULL,
  reminder     VARCHAR(10),
  color        ENUM('pink','lavender','sage','sky','cream') NOT NULL DEFAULT 'pink',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS habit_completions (
  habit_id     VARCHAR(36) NOT NULL,
  date         DATE NOT NULL,
  PRIMARY KEY (habit_id, date),
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
