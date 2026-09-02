import re


def normalize_text(text: str) -> set[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)

    return set(text.split())


def calculate_answer_similarity(
    generated_answer: str,
    expected_answer: str,
) -> float:
    generated_words = normalize_text(generated_answer)
    expected_words = normalize_text(expected_answer)

    if not generated_words or not expected_words:
        return 0.0

    common_words = generated_words.intersection(expected_words)

    return round(
        len(common_words) / len(expected_words),
        3,
    )


def is_answer_correct(
    generated_answer: str,
    expected_answer: str,
    threshold: float = 0.6,
) -> bool:
    similarity = calculate_answer_similarity(
        generated_answer=generated_answer,
        expected_answer=expected_answer,
    )

    return similarity >= threshold