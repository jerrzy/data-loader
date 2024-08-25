CREATE TABLE assets (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    asset_type ENUM('stock', 'option', 'crypto', 'perpetual') NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    UNIQUE (symbol)
);

CREATE TABLE ohlcv(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    asset_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,  -- 冗余字段
    level ENUM('second', 'minut', 'hour', 'day') NOT NULL,
    open DECIMAL(18, 8) NOT NULL,
    high DECIMAL(18, 8) NOT NULL,
    low DECIMAL(18, 8) NOT NULL,
    close DECIMAL(18, 8) NOT NULL,
    adj_close DECIMAL(18, 8) NOT NULL, -- 新增调整后的收盘价列
    volume DECIMAL(18, 8) NOT NULL,
    date_time DATETIME NOT NULL,
    INDEX idx_symbol_level
    _datetime(symbol, level, date_time),
    INDEX idx_assetid(asset_id)
);