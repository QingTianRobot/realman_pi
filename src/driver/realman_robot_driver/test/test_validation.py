import pytest

from realman_robot_driver.validation import positive_float, positive_int


@pytest.mark.parametrize("value", [0, -1, 1.5, True, "10", None])
def test_positive_int_rejects_non_positive_non_int_and_bool(value):
    with pytest.raises(ValueError, match="control_period_ms must be a positive integer"):
        positive_int(value, "control_period_ms")


def test_positive_int_returns_the_value():
    assert positive_int(10, "control_period_ms") == 10


@pytest.mark.parametrize("value", [0, -0.1, float("nan"), float("inf"), True, "1.0", None])
def test_positive_float_rejects_non_finite_non_positive_and_bool(value):
    with pytest.raises(ValueError, match="max_linear_accel must be positive"):
        positive_float(value, "max_linear_accel")


def test_positive_float_accepts_ints_and_returns_a_float():
    assert positive_float(2, "x") == 2.0
    assert isinstance(positive_float(2, "x"), float)
