"""
Ollama client for local LLM inference.
Uses the Ollama HTTP API directly with httpx.
"""

import httpx
import json
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class OllamaClient:
    """Minimal Ollama HTTP client for /api/generate endpoint."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: Optional[int] = None
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL
        self.timeout_seconds = timeout_seconds or settings.OLLAMA_TIMEOUT_SECONDS

    def is_available(self) -> bool:
        """Check if Ollama is reachable."""
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    def model_exists(self) -> bool:
        """Check if the configured model is available."""
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    return any(m.get("name", "").startswith(self.model) for m in models)
        except Exception:
            pass
        return False

    def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        format_json: bool = False,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a response from Ollama.
        
        Args:
            prompt: The user prompt
            system: Optional system prompt
            format_json: If True, request JSON output format
            options: Additional generation options (temperature, etc.)
        
        Returns:
            Dict with 'response' key containing the generated text
            
        Raises:
            httpx.HTTPError: On connection or HTTP errors
            ValueError: If response is invalid
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        
        if system:
            payload["system"] = system
        
        if format_json:
            payload["format"] = "json"
        
        if options:
            payload["options"] = options

        with httpx.Client(timeout=self.timeout_seconds) as client:
            response = client.post(
                f"{self.base_url}/api/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "response" not in result:
                raise ValueError(f"Unexpected Ollama response format: {result}")
            
            return result


def get_ollama_client() -> OllamaClient:
    """Factory function to get an Ollama client instance."""
    return OllamaClient()


async def call_ollama(
    prompt: str,
    system: Optional[str] = None,
    format_json: bool = False
) -> str:
    """
    Async wrapper for Ollama generation.
    
    Returns the raw response text from the model.
    """
    client = get_ollama_client()
    result = client.generate(prompt=prompt, system=system, format_json=format_json)
    return result["response"]