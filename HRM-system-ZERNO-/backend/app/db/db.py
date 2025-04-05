from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import connection_string

async_engine = create_async_engine(
    connection_string, 
    echo=False,
    pool_size=20,          # Increased pool size
    max_overflow=20,       # Increased overflow
    pool_timeout=60,       # Increased timeout
    pool_pre_ping=True,    # Connection health check
    pool_recycle=3600     # Connection recycle time
)

async_session = sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_pool_stats():
    pool = async_engine.pool
    print(f"Открытых соединений: {pool.size()}")
    print(f"Ожидающих соединений: {pool.checkedin()}")
    return 
    
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            print("CLOSING SESSION\n\n")
            await session.close()


async def create_all():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

Base = declarative_base()
