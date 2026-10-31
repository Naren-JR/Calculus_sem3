"""Explicit full-batch GD; dataset README is the authoritative formulation."""
import csv
from pathlib import Path
import numpy as np

DATA = Path(__file__).resolve().parents[2] / 'data'

def samples():
    with (DATA / 'synthetic_vehicle_resistance_dataset.csv').open() as file:
        return [{key: float(value) for key, value in row.items()} for row in csv.DictReader(file)]

def fit(initial_c0=0., initial_c2=0., learning_rate=.15, iterations=2000):
    rows = samples()
    v = np.array([r['speed_mps'] for r in rows])
    target = np.array([r['force_N'] for r in rows])
    X = np.column_stack([np.ones(len(v)), (v / 50.) ** 2])
    theta = np.array([initial_c0, initial_c2 * 2500.])
    bound = float(2 / np.linalg.eigvalsh(X.T @ X / len(v))[-1])
    history = []
    status = 'Maximum iterations reached'
    for step in range(iterations + 1):
        residual = X @ theta - target
        loss = float(np.mean(residual ** 2) / 2)
        gradient = X.T @ residual / len(v)
        if not np.isfinite(loss) or loss > 1e18:
            status = 'Diverged: reduce the learning rate'
            break
        history.append(dict(step=step, c0=float(theta[0]), c2=float(theta[1]/2500),
                            theta0=float(theta[0]), theta1=float(theta[1]), loss=loss,
                            gradient=gradient.tolist(), gradient_norm=float(np.linalg.norm(gradient)),
                            rmse=float(np.sqrt(2*loss))))
        if np.linalg.norm(gradient) < 1e-8:
            status = 'Converged'
            break
        if step < iterations:
            theta -= learning_rate * gradient
    reference = np.linalg.lstsq(X, target, rcond=None)[0]
    return dict(history=history, status=status, stable_rate_upper_bound=bound,
                reference=dict(c0=float(reference[0]), c2=float(reference[1]/2500)),
                config=dict(initial_c0=initial_c0, initial_c2=initial_c2,
                            learning_rate=learning_rate, iterations=iterations),
                source='Synthetic supplied CSV; force_N target; speed scale 50 m/s')
