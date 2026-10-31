import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ConfigDict
from .optimizer import DATA, fit, samples

app = FastAPI(title='F1 Drag Lab', version='1.0.0')

class RunConfig(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)
    initial_c0: float = Field(default=0, ge=0, le=1000)
    initial_c2: float = Field(default=0, ge=0, le=1)
    learning_rate: float = Field(default=.15, gt=0, le=3)
    iterations: int = Field(default=2000, ge=1, le=10000)

@app.get('/api/health')
def health():
    return {'status': 'ok'}

@app.get('/api/dataset')
def dataset():
    return dict(samples=samples(), metadata=json.loads((DATA/'synthetic_vehicle_resistance_dataset_metadata.json').read_text()),
                track=json.loads((DATA/'track.json').read_text()), vehicle=json.loads((DATA/'vehicle.json').read_text()))

@app.post('/api/optimize')
def optimize(config: RunConfig):
    return fit(**config.model_dump())

dist = Path(__file__).resolve().parents[2] / 'frontend/dist'
if dist.exists():
    app.mount('/', StaticFiles(directory=dist, html=True), name='frontend')
