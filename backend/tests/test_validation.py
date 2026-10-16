import pytest
from pydantic import ValidationError
from backend.models import ProductInput, GenerateRequest

def test_product_input_valid():
    inp = ProductInput(
        product_name="Soy Wax Candle",
        category="Home Decor",
        features_and_specs="8 oz jar, pure lavender essential oils, wooden wick",
        price=24.50,
        currency="USD"
    )
    assert inp.product_name == "Soy Wax Candle"
    assert inp.price == 24.50
    assert inp.currency == "USD"

def test_product_input_name_too_short():
    with pytest.raises(ValidationError):
        ProductInput(
            product_name="X",
            category="Home",
            features_and_specs="Valid specs that exceed five characters"
        )

def test_product_input_specs_too_short():
    with pytest.raises(ValidationError):
        ProductInput(
            product_name="Valid Name",
            category="Home",
            features_and_specs="Tiny"
        )

def test_negative_price_rejected():
    with pytest.raises(ValidationError):
        ProductInput(
            product_name="Valid Name",
            category="Home",
            features_and_specs="Valid specs that exceed five characters",
            price=-10.0
        )
