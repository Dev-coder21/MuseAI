from typing import Optional, Dict, Any


class PromptProcessor:
    """
    Parses and transforms user free-form descriptions and structured musical controls
    into an optimized natural-language prompt for Meta MusicGen.
    """

    @staticmethod
    def process(
        prompt: Optional[str] = None,
        mood: Optional[str] = None,
        genre: Optional[str] = None,
        instrument: Optional[str] = None,
        intensity: Optional[str] = None,
        tempo: Optional[str] = None,
        purpose: Optional[str] = None,
        **extra_controls
    ) -> Dict[str, Any]:
        """
        Builds a cohesive final prompt from user input text and structured musical options.
        """
        raw_prompt = (prompt or "").strip()

        # Collect non-empty structured attributes
        controls = {}
        if mood and mood.strip():
            controls["mood"] = mood.strip()
        if genre and genre.strip():
            controls["genre"] = genre.strip()
        if instrument and instrument.strip():
            controls["instrument"] = instrument.strip()
        if intensity and intensity.strip():
            controls["intensity"] = intensity.strip()
        if tempo and tempo.strip():
            controls["tempo"] = tempo.strip()
        if purpose and purpose.strip():
            controls["purpose"] = purpose.strip()

        # Build prompt elements carefully
        descriptors = []
        if "mood" in controls:
            descriptors.append(controls["mood"].lower())
        if "tempo" in controls:
            descriptors.append(f"{controls['tempo'].lower()} tempo")
        if "intensity" in controls:
            descriptors.append(f"{controls['intensity'].lower()} intensity")

        descriptor_str = ", ".join(descriptors) if descriptors else ""

        genre_instr = []
        if "genre" in controls:
            genre_instr.append(controls["genre"])
        if "instrument" in controls:
            genre_instr.append(controls["instrument"])

        style_str = " ".join(genre_instr) if genre_instr else "music composition"

        # Build constructed prompt sentence
        constructed_parts = []
        if raw_prompt:
            constructed_parts.append(raw_prompt)

        phrase_elements = []
        if descriptor_str:
            phrase_elements.append(f"in a {descriptor_str} style")
        if "purpose" in controls:
            phrase_elements.append(f"suitable for {controls['purpose'].lower()}")

        if phrase_elements and not raw_prompt:
            constructed_parts.append(f"A {style_str} " + " ".join(phrase_elements))
        elif phrase_elements and raw_prompt:
            # Append descriptor context to user's custom prompt if not already present
            additions = " ".join(phrase_elements)
            if additions.lower() not in raw_prompt.lower():
                constructed_parts.append(f"({additions})")

        # Fallback if both prompt and controls are empty
        if not constructed_parts:
            final_prompt = "A calm acoustic instrumental music composition"
        else:
            final_prompt = ", ".join(constructed_parts)

        # Clean up double punctuation or spaces
        final_prompt = " ".join(final_prompt.split())

        return {
            "original_prompt": raw_prompt,
            "controls": controls,
            "final_prompt": final_prompt,
        }
