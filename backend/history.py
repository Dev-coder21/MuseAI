import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime
from backend.config import METADATA_DIR

logger = logging.getLogger("museai.history")


class HistoryManager:
    """
    Manages saving and retrieving music generation metadata records.
    """

    @staticmethod
    def save_record(metadata: Dict[str, Any]) -> str:
        """Saves generation metadata to a JSON file."""
        gen_id = metadata.get("generation_id")
        if not gen_id:
            raise ValueError("Metadata must contain 'generation_id'")

        record = {
            **metadata,
            "created_at": datetime.now().isoformat(),
        }

        filepath = METADATA_DIR / f"{gen_id}.json"
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(record, f, indent=2)

        logger.info(f"Saved metadata record to {filepath}")
        return str(filepath)

    @staticmethod
    def get_record(gen_id: str) -> Dict[str, Any]:
        """Loads metadata record by generation_id."""
        filepath = METADATA_DIR / f"{gen_id}.json"
        if not filepath.exists():
            raise FileNotFoundError(f"Record '{gen_id}' not found.")

        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def list_history(limit: int = 50) -> List[Dict[str, Any]]:
        """Returns all history records sorted by creation timestamp."""
        records = []
        for file_path in METADATA_DIR.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    records.append(data)
            except Exception as e:
                logger.warning(f"Error reading history file {file_path}: {e}")

        # Sort descending by created_at
        records.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return records[:limit]
