DROP TABLE IF EXISTS images;
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    filename TEXT,
    content_type TEXT,
    size INTEGER,
    description TEXT,
    tags TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
