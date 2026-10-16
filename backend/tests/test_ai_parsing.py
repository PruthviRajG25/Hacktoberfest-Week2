import pytest
from backend.ai.providers import extract_and_parse_json, AIProviderError

def test_extract_clean_json():
    raw = '{"title": "Clean Product", "description": "Desc", "highlights": ["A"], "keywords": ["k1"], "social_caption": "Cap", "call_to_action": "Buy", "alternative_titles": ["Alt"]}'
    parsed = extract_and_parse_json(raw)
    assert parsed["title"] == "Clean Product"

def test_extract_json_with_markdown_blocks():
    raw = """```json
{
  "title": "Fenced Product",
  "description": "Fenced Desc",
  "highlights": ["H1"],
  "keywords": ["tag1"],
  "social_caption": "Caption",
  "call_to_action": "Shop now",
  "alternative_titles": []
}
```"""
    parsed = extract_and_parse_json(raw)
    assert parsed["title"] == "Fenced Product"

def test_extract_json_with_surrounding_commentary():
    raw = """Here is the product listing you requested:
{
  "title": "Surrounded Product",
  "description": "Desc",
  "highlights": [],
  "keywords": [],
  "social_caption": "Cap",
  "call_to_action": "CTA",
  "alternative_titles": []
}
Hope this helps!"""
    parsed = extract_and_parse_json(raw)
    assert parsed["title"] == "Surrounded Product"

def test_extract_invalid_json_raises_error():
    raw = "This is not json at all."
    with pytest.raises(AIProviderError):
        extract_and_parse_json(raw)
