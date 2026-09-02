import re


def normalize_text(text: str) -> set[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)

    return set(text.split())


def calculate_faithfulness(
    generated_answer: str,
    context: str,
) -> float:
    answer_words = normalize_text(generated_answer)
    context_words = normalize_text(context)

    if not answer_words:
        return 0.0

    supported_words = answer_words.intersection(context_words)

    return round(
        len(supported_words) / len(answer_words),
        3,
    )


def is_faithful(
    generated_answer: str,
    context: str,
    threshold: float = 0.6,
) -> bool:
    score = calculate_faithfulness(
        generated_answer=generated_answer,
        context=context,
    )

    return score >= threshold