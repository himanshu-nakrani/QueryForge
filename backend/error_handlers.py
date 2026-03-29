"""Custom error handlers and exceptions for QueryForge."""
import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

logger = logging.getLogger(__name__)


class QueryForgeException(Exception):
    """Base exception for QueryForge."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class ValidationException(QueryForgeException):
    """Validation error."""
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR", 400)


class ResourceNotFoundException(QueryForgeException):
    """Resource not found error."""
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", "NOT_FOUND", 404)


class DatabaseException(QueryForgeException):
    """Database error."""
    def __init__(self, message: str):
        super().__init__(message, "DATABASE_ERROR", 500)


class FileOperationException(QueryForgeException):
    """File operation error."""
    def __init__(self, message: str):
        super().__init__(message, "FILE_ERROR", 400)


class LLMException(QueryForgeException):
    """LLM service error."""
    def __init__(self, message: str):
        super().__init__(message, "LLM_ERROR", 500)


async def queryforge_exception_handler(request: Request, exc: QueryForgeException):
    """Handle QueryForge exceptions."""
    logger.error(f"QueryForge exception: {exc.code} - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    logger.warning(f"Validation error: {exc}")
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"][1:]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": errors,
            }
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle generic exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            }
        }
    )
