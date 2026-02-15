"""Minimal Modal app for reflex-backend to call. Deploy with: modal deploy modal/train.py"""
import modal

app = modal.App("reflex-rl-training")


@app.function(gpu="T4", timeout=3600)
def train(dataset_snapshot: list = None):
    """Run training; dataset_snapshot is the RL dataset from the frontend."""
    # Replace with your RL/training logic (e.g. load dataset, train, save checkpoint).
    return {"status": "completed", "message": "Training run finished."}
