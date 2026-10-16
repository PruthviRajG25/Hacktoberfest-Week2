import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import db_manager
from backend.routes.health import router as health_router
from backend.routes.listings import router as listings_router
from backend.routes.brand import router as brand_router
from backend.routes.search import router as search_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("open_list")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for initialization and cleanup."""
    logger.info("=================================================")
    logger.info("   Starting Open List - AI Listing Generator     ")
    logger.info("=================================================")
    logger.info(f"Environment:       {settings.ENVIRONMENT}")
    logger.info(f"AI Provider:       {settings.AI_PROVIDER}")
    logger.info(f"Ollama Model:      {settings.OLLAMA_MODEL} ({settings.OLLAMA_BASE_URL})")
    logger.info(f"Database:          {'MongoDB Atlas' if db_manager.is_atlas else 'In-Memory Fallback'}")
    logger.info(f"CORS Origins:      {settings.cors_origins_list}")
    logger.info("=================================================")
    yield
    logger.info("Shutting down Open List application.")


app = FastAPI(
    title="Open List API",
    description="Production-minded AI Product Listing Generator powered by Open-Weight Models & MongoDB Atlas.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers with strict precedence
app.include_router(health_router)
app.include_router(listings_router)
app.include_router(brand_router)
app.include_router(search_router)


# Ensure API 404s always return JSON, not HTML
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "API_NOT_FOUND", "message": f"Endpoint {request.url.path} not found"}
        )
    # For non-API routes, let the SPA fallback handle it below
    dist_dir = os.path.abspath(settings.STATIC_DIR)
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse("<h1>Open List API is running. Frontend build not found.</h1>", status_code=404)


# Mount Static Frontend Files & SPA Routing
dist_dir = os.path.abspath(settings.STATIC_DIR)
assets_dir = os.path.join(dist_dir, "assets")

if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# SPA catch-all for frontend routes (e.g. /dashboard, /create, /saved, /brand, /settings)
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_frontend(full_path: str):
    # Reject /api/* paths from hitting SPA fallback
    if full_path.startswith("api/"):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "API_NOT_FOUND", "message": f"API endpoint /{full_path} not found"}
        )

    # Check for static file in dist (e.g. favicon, vite.svg)
    candidate_file = os.path.join(dist_dir, full_path)
    if os.path.isfile(candidate_file):
        return FileResponse(candidate_file)

    # Return index.html for client-side routing
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return HTMLResponse(
        """
        <!DOCTYPE html>
        <html>
        <head><title>Open List API</title></head>
        <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 80px auto; padding: 20px; line-height: 1.6;">
            <h1 style="color: #4f46e5;">Open List Backend API</h1>
            <p>The FastAPI backend server is operational.</p>
            <p><strong>Interactive Swagger Documentation:</strong> <a href="/docs">/docs</a></p>
            <p><strong>API Health Endpoint:</strong> <a href="/api/health/ready">/api/health/ready</a></p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #64748b; font-size: 0.9em;">To view the full React interface, build the frontend with <code>npm run build</code> inside the <code>frontend</code> directory.</p>
        </body>
        </html>
        """
    )
