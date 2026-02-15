# Integrating Modal for training (GPU sandbox & RL)

This doc describes how to wire [Modal](https://modal.com) into Reflex so you can kick off training from the RL dataset page.

## reflex-backend (recommended, fewer knobs)

**reflex-backend** implements training using the **Modal JavaScript SDK**. You only set env and deploy one Modal app.

1. **Env** (in reflex-backend): Set `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET` (from [Modal settings](https://modal.com/settings)). Optional: `MODAL_APP_NAME` (default `reflex-rl-training`), `MODAL_FUNCTION_NAME` (default `train`).
2. **Modal app** (Python): Deploy an app named `reflex-rl-training` with a function `train` that accepts optional `dataset_snapshot` and runs your training (e.g. GPU, Volumes). Deploy with `modal deploy train.py`.
3. **Frontend**: Points `VITE_API_BASE_URL` at reflex-backend. "Train model" on the RL page calls `POST /train` and polls `GET /train/:job_id`.

No Python backend required; no extra knobs beyond the env vars.

## Architecture (reflex-backend)

```
[RL page] → POST /train (reflex-backend) → Modal JS SDK → Modal cloud (GPU / training)
                ↑                                ↑
                └── MODAL_TOKEN_ID, MODAL_TOKEN_SECRET
```

- **Frontend**: "Train model" sends the current dataset; backend returns `job_id`; frontend polls for status.
- **Backend** (reflex-backend): Uses the `modal` npm package; spawns the deployed function and returns `functionCallId`; GET /train/:job_id polls via `functionCalls.fromId(id).get({ timeoutMs: 0 })`.
- **Modal**: Runs your training code (Python) on GPU, with optional [Volumes](https://modal.com/docs/guide/volumes) for checkpoints.

### Minimal Modal app example (Python)

This repo includes **modal/train.py**. Deploy so reflex-backend has something to call:

```bash
pip install modal
modal token new   # once; get tokens from https://modal.com/settings
modal deploy modal/train.py
```

The app name must be `reflex-rl-training` and the function `train` (or set `MODAL_APP_NAME` / `MODAL_FUNCTION_NAME` in reflex-backend to match).

---

## Option A: Backend with Modal Python SDK (alternative)

Keep credentials server-side and trigger Modal from Python.

### 1. Modal app (separate repo or `/modal` in this repo)

Example `train.py` to deploy with `modal deploy train.py`:

```python
import modal

app = modal.App("reflex-rl-training")

# Optional: persist checkpoints and dataset between runs
volume = modal.Volume.from_name("reflex-rl-volume", create_if_missing=True)

@app.function(
    gpu="A10G",  # or "T4", "A100", etc.
    timeout=3600,
    volumes={"/data": volume},
)
def train_on_dataset(dataset_snapshot: list[dict], training_type: str = "rl"):
    """Run training (RL or fine-tuning) on the provided dataset snapshot."""
    # e.g. mount dataset to /data, run your training script
    # training_type in ("rl", "gpu_sandbox", "finetune")
    import subprocess
    # Your actual training logic here; write dataset to /data, run training
    return {"status": "completed", "metrics": {}}

@app.function(gpu="A10G", timeout=600)
def kickoff_gpu_sandbox():
    """Start a one-off GPU sandbox for experimentation."""
    # Optional: run a Jupyter or shell that stays up
    return {"status": "sandbox_ready", "message": "GPU sandbox is running"}
```

Deploy:

```bash
pip install modal
modal token new   # once; writes ~/.modal.toml
modal deploy train.py
```

### 2. Backend API (Python)

Your backend (e.g. Flask/FastAPI or the same service that serves the Reflex API) needs:

- Env: `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET` (from `modal token new` or Modal dashboard).
- **POST /api/train** (or same path your frontend calls): body e.g. `{ "training_type": "rl" | "gpu_sandbox", "dataset_snapshot": [...] }`.
  - Load dataset from your DB (or accept snapshot in body).
  - Call Modal:
    - `f = modal.Function.from_name("reflex-rl-training", "train_on_dataset")` then `call = f.spawn(dataset_snapshot, training_type="rl")`.
  - Return `{ "job_id": call.object_id, "status": "pending" }`.
- **GET /api/train/:job_id**: use `modal.FunctionCall.from_id(job_id)` and `function_call.get(timeout=0)` to return status or result (or poll Modal’s API). Return e.g. `{ "status": "pending" | "running" | "completed" | "failed", "result": ... }`.

So the **frontend** in this repo already calls `POST /api/train` and `GET /api/train/:job_id`. You only need to implement those two routes in a backend that has the Modal SDK and credentials.

### 3. Frontend (this app)

- RL page has a **"Train model"** button that opens a **Dialog**.
- User selects **"Kick off GPU sandbox"** or **"Train on RL"** (and optionally options).
- On submit, frontend sends `POST /api/train` with the chosen `training_type` and current dataset (or a flag to “use latest from server”).
- Response: `{ job_id, status }` → show job id and poll `GET /api/train/:job_id` until status is terminal.
- If backend returns `501` or `{ "error": "not_implemented" }`, the UI shows a short message and points to this doc.

## Option B: Trigger Modal via HTTPS (no Python backend)

If you don’t want a Python backend:

1. In your Modal app, expose a [web endpoint](https://modal.com/docs/guide/webhooks), e.g. `@modal.web_endpoint()` or `@modal.fastapi_endpoint()`.
2. That endpoint receives the request (e.g. training type + dataset or “use latest”), starts the training function with `.spawn()` inside Modal, and returns a job id. You can store the `FunctionCall` in a Modal Volume or external store and poll from another endpoint.
3. Frontend calls the Modal web URL (with auth if you add it) instead of your own `/api/train`. Downside: the endpoint URL is public unless you add your own auth; keeping tokens in a Python backend (Option A) is simpler and safer.

## Summary

| Piece            | Responsibility |
|------------------|----------------|
| **Modal app**    | Define `train_on_dataset` (and optionally `kickoff_gpu_sandbox`) with GPU, volumes; deploy with `modal deploy`. |
| **Your backend** | Implement `POST /api/train` and `GET /api/train/:job_id` using the Modal Python SDK and env credentials; return job id and status. |
| **This frontend**| "Train model" dialog → POST /api/train → show job id and poll status; show a “not configured” message if backend returns 501/not_implemented. |

Once the backend and Modal app are in place, training from the RL dataset page is end-to-end.
