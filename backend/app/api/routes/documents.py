import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.document_service import document_service

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_spec.txt"
    filename_lower = filename.lower()

    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx") or filename_lower.endswith(".txt")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF, DOCX, or TXT tender document."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum allowed limit of 10MB."
        )

    try:
        extracted_text = document_service.extract_text(filename, content)
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(
                status_code=422,
                detail="Unable to extract meaningful text from document. Please ensure file contains readable text."
            )

        return {
            "status": "ok",
            "filename": filename,
            "character_count": len(extracted_text),
            "text": extracted_text[:4000]  # Return clean text snippet for requirement parsing
        }
    except Exception as e:
        logger.error(f"Error processing uploaded document: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process document. Please paste the requirement text directly."
        )
