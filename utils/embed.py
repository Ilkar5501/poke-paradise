import discord

# Color constants
INFO_COLOR = 0x27ae60      # Deep verdant green for info/inventory
MOVES_COLOR = 0xF1C40F     # Pencil yellow for learnable moves
DUEL_COLOR = 0xC0392B      # Strong red for duels
NATURE_COLOR = 0x1ABC9C    # Cyan-esque light blue for natures

# Emojis
EMOJI_BP = "💥"
EMOJI_ACC = "🎯"
EMOJI_DUEL = "⚔️"

# Helper to title-case slugs (replace hyphens and capitalize)
def title_case(s: str) -> str:
    return s.replace("-", " ").title()

class EmbedBuilder:
    """
    Standardized Discord embed toolkit.
    Provides base builders for various contexts: info, moves, duel, natures.
    """

    @staticmethod
    def base(color: int) -> discord.Embed:
        """Create a bare embed with the given color."""
        return discord.Embed(color=color)

    @staticmethod
    def success(title: str, description: str) -> discord.Embed:
        """Green success embed with checkmark icon."""
        embed = discord.Embed(
            title=f"✅ {title}",
            description=description,
            color=INFO_COLOR
        )
        return embed

    @staticmethod
    def error(message: str) -> discord.Embed:
        """Red error embed with fixed 'Error' title."""
        embed = discord.Embed(
            title="❌ Error",
            description=message,
            color=0xE74C3C
        )
        return embed

    @staticmethod
    def info(title: str, fields: list[tuple[str, str]]) -> discord.Embed:
        """Deep green embed for informational displays (e.g., inventory, info)."""
        embed = discord.Embed(title=title, color=INFO_COLOR)
        for name, value in fields:
            embed.add_field(name=title_case(name), value=value, inline=False)
        return embed

    @staticmethod
    def moves(title: str, moves: list[dict]) -> discord.Embed:
        """Yellow embed listing learnable moves with custom emojis and formatting."""
        embed = discord.Embed(title=title, color=MOVES_COLOR)
        for m in moves:
            name = title_case(m['name'])
            bp = m.get('bp', 0)
            acc = m.get('accuracy', 0)
            typ = title_case(m.get('type', ''))
            cat = m.get('category', '').upper()  # 'PHYS' or 'SPEC'
            # Format: 💥 **BP** | 🎯 **ACC%** | TYPE | CAT
            value = f"{EMOJI_BP} **{bp}** | {EMOJI_ACC} **{acc}%** | {typ} | {cat}"
            embed.add_field(name=name, value=value, inline=False)
        return embed

    @staticmethod
    def duel(title: str, fields: list[tuple[str, str]], footer: str = None) -> discord.Embed:
        """Red embed for duel panels and battle state."""
        embed = discord.Embed(title=title, color=DUEL_COLOR)
        for name, value in fields:
            embed.add_field(name=title_case(name), value=value, inline=True)
        if footer:
            embed.set_footer(text=footer)
        return embed

    @staticmethod
    def nature(title: str, fields: list[tuple[str, str]]) -> discord.Embed:
        """Cyan embed for displaying and changing natures."""
        embed = discord.Embed(title=title, color=NATURE_COLOR)
        for name, value in fields:
            embed.add_field(name=title_case(name), value=value, inline=True)
        return embed
