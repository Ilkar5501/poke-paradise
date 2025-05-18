import json
import re
from difflib import get_close_matches

# Load pokedex.json and form_map.json from /mnt/data
with open('/mnt/data/pokedex.json') as f:
    POKEDEX = json.load(f)

with open('/mnt/data/form_map.json') as f:
    raw_form_map = json.load(f)
# Convert raw_form_map to simple dict: base_slug -> list of form slugs
FORM_MAP = {base: [entry['form'] for entry in forms] for base, forms in raw_form_map.items()}

# Universe of all slugs
ALL_SLUGS = set(POKEDEX.keys())

# Build dynamic qualifiers from form slugs (everything after the first hyphen)
DYNAMIC_QUALS = set()
for form_list in FORM_MAP.values():
    for slug in form_list:
        parts = slug.split('-')[1:]  # drop the base slug, keep qualifiers
        DYNAMIC_QUALS.update(parts)

def normalize(s: str) -> str:
    """Lowercase, strip punctuation except hyphens and spaces."""
    return re.sub(r'[^a-z0-9 \-]', '', s.lower()).strip()

def extract_qualifiers(tokens: list[str]):
    """
    Pull out tokens that match known qualifiers.
    """
    found = [t for t in tokens if t in DYNAMIC_QUALS]
    base_tokens = [t for t in tokens if t not in found]
    return base_tokens, found

def fuzzy_match(query: str, choices: list[str], cutoff=0.6):
    """
    Return the best fuzzy match for query in choices.
    """
    matches = get_close_matches(query, choices, n=1, cutoff=cutoff)
    return matches[0] if matches else None

def match_pokemon(query: str) -> str | None:
    """
    Updated matcher prioritizing qualifiers before broad fuzzy matching.
    """
    norm = normalize(query)
    tokens = norm.replace('-', ' ').split()

    # Exact slug match
    if norm in ALL_SLUGS:
        return norm

    # Extract qualifiers
    base_tokens, qualifiers = extract_qualifiers(tokens)
    base_query = ' '.join(base_tokens)

    # If qualifiers present, try to match specific form
    if qualifiers:
        # Fuzzy match base to base species
        base_slug = fuzzy_match(base_query, list(FORM_MAP.keys()))
        if base_slug:
            # Look for a form slug containing the qualifier
            for form_slug in FORM_MAP.get(base_slug, []):
                if any(f"-{qual}" in form_slug for qual in qualifiers):
                    return form_slug
            # If no specific form found, return base
            return base_slug

    # No qualifiers or form logic didn't return: broad fuzzy match against all slugs
    slug_match = fuzzy_match(norm, list(ALL_SLUGS))
    if slug_match:
        return slug_match

    # Fallback: fuzzy match to base species
    base_slug = fuzzy_match(base_query, list(FORM_MAP.keys()))
    return base_slug

# Test with "Charizard X"
test_input = "Charizard X"
result = match_pokemon(test_input)
print(f"Input: '{test_input}' -> Matched Slug: '{result}'")

