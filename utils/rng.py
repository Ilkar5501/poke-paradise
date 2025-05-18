import random

class RNG:
    """
    Random number utilities for Pokémon bot:
      - IV generation
      - Shiny roll
      - Dice rolls
    """
    @staticmethod
    def generate_ivs(max_iv: int = 31) -> dict[str, int]:
        """Generate random IVs for each stat between 0 and max_iv."""
        return {
            'hp': random.randint(0, max_iv),
            'atk': random.randint(0, max_iv),
            'def': random.randint(0, max_iv),
            'spa': random.randint(0, max_iv),
            'spd': random.randint(0, max_iv),
            'spe': random.randint(0, max_iv)
        }

    @staticmethod
    def roll_shiny(chance: float = 1/500) -> bool:
        """Return True if a random roll falls below the shiny chance."""
        return random.random() < chance

    @staticmethod
    def roll_die(sides: int = 6) -> int:
        """Roll an n-sided die and return a result between 1 and sides."""
        return random.randint(1, sides)
