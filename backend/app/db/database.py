from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db_migrations():
    """Memastikan skema dan migrasi kolom username & is_verified berjalan deterministik."""
    Base.metadata.create_all(bind=engine)
    if settings.DATABASE_URL.startswith("sqlite"):
        import sqlite3
        import re
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        try:
            con = sqlite3.connect(db_path)
            cur = con.cursor()
            table_info = cur.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
            ).fetchone()
            if table_info:
                columns = [row[1] for row in cur.execute("PRAGMA table_info(users)").fetchall()]
                if "username" not in columns:
                    cur.execute("ALTER TABLE users ADD COLUMN username VARCHAR(50)")
                    users = cur.execute("SELECT id, email FROM users").fetchall()
                    for uid, email in users:
                        prefix = re.sub(r"[^a-z0-9_]", "", email.split("@")[0].lower())
                        username = prefix if len(prefix) >= 4 else f"{prefix}123"
                        cur.execute("UPDATE users SET username = ? WHERE id = ?", (username, uid))
                    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users(username)")
                if "is_verified" not in columns:
                    cur.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 1")
                con.commit()
            con.close()
        except Exception:
            pass
