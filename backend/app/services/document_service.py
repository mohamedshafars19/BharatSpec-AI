import io
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class DocumentService:
    """
    Parses and extracts procurement requirement text from uploaded TXT, PDF, and DOCX files.
    """

    def extract_text(self, filename: str, content: bytes) -> str:
        filename_lower = filename.lower()

        # 1. Plain Text
        if filename_lower.endswith(".txt"):
            try:
                return content.decode("utf-8", errors="replace").strip()
            except Exception as e:
                logger.warning(f"Error decoding TXT file: {e}")
                return content.decode("latin-1", errors="replace").strip()

        # 2. PDF Files
        if filename_lower.endswith(".pdf"):
            try:
                # Try PyMuPDF if installed
                import fitz
                doc = fitz.open(stream=content, filetype="pdf")
                pages_text = []
                for page in doc:
                    pages_text.append(page.get_text())
                return "\n".join(pages_text).strip()
            except ImportError:
                pass
            except Exception as e:
                logger.warning(f"PyMuPDF error: {e}")

            try:
                # Try pypdf fallback
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(content))
                pages = [page.extract_text() or "" for page in reader.pages]
                return "\n".join(pages).strip()
            except Exception as e:
                logger.warning(f"pypdf extraction error: {e}")

            # Basic byte regex extraction fallback for raw text in PDF
            clean_text = re.sub(r'[^\x20-\x7E\n]', ' ', content.decode('latin-1', errors='ignore'))
            readable_chunks = [c for c in clean_text.split() if len(c) > 2]
            return " ".join(readable_chunks[:500])

        # 3. DOCX Files
        if filename_lower.endswith(".docx"):
            try:
                import docx
                doc = docx.Document(io.BytesIO(content))
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                return "\n".join(paragraphs).strip()
            except ImportError:
                # Extract text from docx zip xml
                import zipfile
                import xml.etree.ElementTree as ET
                try:
                    with zipfile.ZipFile(io.BytesIO(content)) as z:
                        xml_content = z.read("word/document.xml")
                        tree = ET.fromstring(xml_content)
                        texts = [node.text for node in tree.iter() if node.text]
                        return " ".join(texts).strip()
                except Exception as e:
                    logger.warning(f"DOCX XML extraction error: {e}")

        # Fallback for unrecognized text
        return content.decode("utf-8", errors="replace").strip()

document_service = DocumentService()
