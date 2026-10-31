# Synthetic Vehicle Resistance Dataset — Teammate Handoff

## Purpose
Demonstrate gradient descent for the low-order model:

`F_res = c0 + c2 * v^2`

## Files
- `synthetic_vehicle_resistance_dataset.csv`: 65 paired speed/force samples.
- `synthetic_vehicle_resistance_dataset_metadata.json`: generation settings, column definitions, and limitations.

## Dataset specification
- Sample count: 65
- Speed range: 5–70 m/s
- Random seed: 24
- Generating equation: `force_N = 180 + 0.32 * speed_mps**2 + noise_N`
- Noise: Gaussian, mean 0 N, standard deviation 30 N
- Known generating coefficients: `c0 = 180 N`, `c2 = 0.32 N·s²/m²`

## Columns
| Column | Meaning | Use |
|---|---|---|
| `sample_id` | Unique sample ID | Identification only |
| `speed_mps` | Synthetic speed in m/s | Input feature |
| `force_N` | Synthetic noisy resistance force in N | **Primary training target** |
| `noise_N` | Added synthetic noise in N | Audit/debug only |
| `force_without_noise_N` | Synthetic force before noise | Debug/visualization only; not the primary target |

## Recommended fitting formulation
Define `x = (speed_mps / 50)^2`, `theta0 = c0`, and `theta1 = 2500*c2`.
Then predict `force_hat = theta0 + theta1*x`.

Minimize:
`L(theta0, theta1) = (1/(2N)) * sum((force_hat - force_N)^2)`

Gradients:
- `dL/dtheta0 = mean(force_hat - force_N)`
- `dL/dtheta1 = mean(x * (force_hat - force_N))`

Update:
`theta = theta - learning_rate * gradient`

Recover:
- `c0 = theta0`
- `c2 = theta1 / 2500`

Compare gradient descent against least-squares regression on the same `speed_mps` and `force_N` columns. Plot observed force vs speed, fitted curve, loss vs iteration, and residuals.

## Research integrity / limitations
This is **synthetic teaching data**, not real F1 measurements. The force values were generated using the assumed model plus noise; they are not independent measured force labels. Results demonstrate implementation and optimization behaviour only and must not be described as real-car calibration.

Public F1 speed telemetry alone does not provide resistance force. Real calibration requires independently measured resistance-force observations paired with speed.
