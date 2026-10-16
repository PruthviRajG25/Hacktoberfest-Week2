import re
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple, Union
import httpx
from pydantic import ValidationError

from backend.config import settings
from backend.models import ProductInput, GeneratedListing, BrandProfile
from backend.ai.prompts import SYSTEM_INSTRUCTION, build_listing_prompt, build_section_prompt

logger = logging.getLogger("open_list.ai")


class AIProviderError(Exception):
    """Base exception for AI generation errors."""
    pass


class AIProviderUnavailableError(AIProviderError):
    """Raised when the AI model inference service cannot be reached or is offline."""
    pass


def extract_and_parse_json(text: str) -> Dict[str, Any]:
    """Robustly extract and parse JSON object from LLM output, handling markdown blocks."""
    cleaned = text.strip()
    # Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
    cleaned = cleaned.strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try finding the first '{' and last '}'
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start:end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as err:
            logger.error(f"Failed to parse extracted JSON substring: {err}. Raw text:\n{text}")

    raise AIProviderError(f"AI model did not return a valid JSON object. Raw response preview: {text[:200]}...")


class BaseAIProvider(ABC):
    @abstractmethod
    async def check_availability(self) -> Tuple[bool, str]:
        """Check if provider and configured model are operational."""
        pass

    @abstractmethod
    async def generate_listing(self, product_input: ProductInput, brand_profile: Optional[BrandProfile] = None) -> GeneratedListing:
        """Generate structured product listing from product inputs."""
        pass

    @abstractmethod
    async def regenerate_section(self, section: str, product_input: ProductInput, current_content: Optional[str] = None, custom_instruction: Optional[str] = None) -> Union[str, List[str]]:
        """Regenerate a specific section."""
        pass

    @abstractmethod
    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """Generate a dense vector embedding for semantic search."""
        pass


class OllamaProvider(BaseAIProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    async def check_availability(self) -> Tuple[bool, str]:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    # Check exact or prefix match (e.g. gemma3:1b or gemma3:1b-instruct)
                    has_model = any(self.model in m or m.startswith(self.model) for m in models)
                    if has_model:
                        return True, f"Ollama is online with model '{self.model}' ready."
                    return True, f"Ollama is online, but model '{self.model}' is not in the installed list ({', '.join(models) or 'none'}). Please run `ollama pull {self.model}`."
                return False, f"Ollama returned HTTP status {res.status_code}."
        except Exception as e:
            return False, f"Cannot connect to local Ollama at {self.base_url}. Ensure Ollama is running (`ollama serve`). Details: {str(e)}"

    async def generate_listing(self, product_input: ProductInput, brand_profile: Optional[BrandProfile] = None) -> GeneratedListing:
        prompt = build_listing_prompt(product_input, brand_profile)
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
                "num_ctx": 4096,
                "num_predict": 1024
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code != 200:
                    raise AIProviderError(f"Ollama returned error status {res.status_code}: {res.text}")
                
                data = res.json()
                content = data.get("message", {}).get("content", "")
                if not content:
                    raise AIProviderError("Ollama returned an empty response.")

                parsed_json = extract_and_parse_json(content)
                
                # Sanitize and validate with Pydantic
                # Ensure highlights and keywords are lists
                if isinstance(parsed_json.get("highlights"), str):
                    parsed_json["highlights"] = [h.strip("- ") for h in parsed_json["highlights"].split("\n") if h.strip()]
                if isinstance(parsed_json.get("keywords"), str):
                    parsed_json["keywords"] = [k.strip() for k in parsed_json["keywords"].split(",") if k.strip()]
                if isinstance(parsed_json.get("alternative_titles"), str):
                    parsed_json["alternative_titles"] = [t.strip() for t in parsed_json["alternative_titles"].split("\n") if t.strip()]

                return GeneratedListing(**parsed_json)

        except httpx.ConnectError as e:
            raise AIProviderUnavailableError(
                f"Could not connect to Ollama at {self.base_url}. Is Ollama running? (Command: `ollama run {self.model}`)"
            ) from e
        except httpx.TimeoutException as e:
            raise AIProviderError(
                f"Generation timed out after {self.timeout}s. The model may be busy or your laptop resources are constrained."
            ) from e
        except ValidationError as e:
            logger.error(f"Pydantic validation error on LLM output: {e}")
            raise AIProviderError(f"AI generated invalid listing format: {e.errors()[0].get('msg', str(e))}")

    async def regenerate_section(self, section: str, product_input: ProductInput, current_content: Optional[str] = None, custom_instruction: Optional[str] = None) -> Union[str, List[str]]:
        prompt = build_section_prompt(section, product_input, current_content, custom_instruction)
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a specialized ecommerce copywriter. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {"temperature": 0.4, "num_ctx": 2048}
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code != 200:
                    raise AIProviderError(f"Ollama returned error: {res.text}")
                data = res.json()
                content = data.get("message", {}).get("content", "")
                parsed = extract_and_parse_json(content)
                val = parsed.get(section)
                if val is not None:
                    return val
                # Fallback to first dict value if key mismatch
                if parsed and len(parsed) > 0:
                    return next(iter(parsed.values()))
                raise AIProviderError(f"Missing {section} in regenerated response.")
        except Exception as e:
            logger.error(f"Error regenerating section {section}: {e}")
            raise AIProviderError(f"Failed to regenerate {section}: {str(e)}")

    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding using Ollama."""
        try:
            # We can use the configured EMBEDDING_MODEL or OLLAMA_MODEL
            model = settings.EMBEDDING_MODEL or self.model
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": model, "prompt": text}
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("embedding")
        except Exception as e:
            logger.warning(f"Could not generate embedding via Ollama: {e}")
        return None


class HostedOpenAICompatibleProvider(BaseAIProvider):
    """
    Adapter for remote inference endpoints that support OpenAI-compatible API and host open-weight models.
    Works with Together AI, Groq, vLLM, RunPod, Hyperbolic, etc.
    """
    def __init__(self):
        self.base_url = (settings.OPENAI_COMPATIBLE_BASE_URL or "").rstrip("/")
        self.api_key = settings.OPENAI_COMPATIBLE_API_KEY or ""
        self.model = settings.OPENAI_COMPATIBLE_MODEL or "google/gemma-2-9b-it"
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    async def check_availability(self) -> Tuple[bool, str]:
        if not self.base_url:
            return False, "OPENAI_COMPATIBLE_BASE_URL is not configured."
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/models", headers=headers)
                if res.status_code in [200, 401]:  # 401 means server is there but key needed
                    return True, f"Remote inference endpoint at {self.base_url} is reachable."
                return False, f"Remote endpoint returned status {res.status_code}."
        except Exception as e:
            return False, f"Could not reach remote inference endpoint at {self.base_url}: {str(e)}"

    async def generate_listing(self, product_input: ProductInput, brand_profile: Optional[BrandProfile] = None) -> GeneratedListing:
        if not self.base_url:
            raise AIProviderUnavailableError("Hosted inference provider is selected but OPENAI_COMPATIBLE_BASE_URL is not set.")

        prompt = build_listing_prompt(product_input, brand_profile)
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
            "max_tokens": 1200
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code != 200:
                    raise AIProviderError(f"Hosted inference endpoint returned status {res.status_code}: {res.text}")
                
                data = res.json()
                choices = data.get("choices", [])
                if not choices:
                    raise AIProviderError("Remote inference returned no choices.")
                content = choices[0].get("message", {}).get("content", "")
                parsed = extract_and_parse_json(content)
                return GeneratedListing(**parsed)

        except httpx.ConnectError as e:
            raise AIProviderUnavailableError(f"Failed to connect to hosted inference endpoint: {e}")
        except ValidationError as e:
            raise AIProviderError(f"Validation error on remote output: {e}")

    async def regenerate_section(self, section: str, product_input: ProductInput, current_content: Optional[str] = None, custom_instruction: Optional[str] = None) -> Union[str, List[str]]:
        prompt = build_section_prompt(section, product_input, current_content, custom_instruction)
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a professional copywriter. Respond in JSON only."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.4
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                data = res.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                parsed = extract_and_parse_json(content)
                return parsed.get(section, next(iter(parsed.values())))
        except Exception as e:
            raise AIProviderError(f"Error regenerating section: {e}")

    async def get_embedding(self, text: str) -> Optional[List[float]]:
        if not self.base_url:
            return None
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/embeddings",
                    headers=headers,
                    json={"input": text, "model": settings.EMBEDDING_MODEL}
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("data", [{}])[0].get("embedding")
        except Exception as e:
            logger.warning(f"Failed to generate embedding via remote endpoint: {e}")
        return None


def get_ai_provider() -> BaseAIProvider:
    """Factory to retrieve configured AI provider."""
    provider_name = (settings.AI_PROVIDER or "ollama").lower().strip()
    if provider_name == "hosted_openai_compatible":
        return HostedOpenAICompatibleProvider()
    return OllamaProvider()
