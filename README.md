# F1 Drag Lab

A local calculus workstation for estimating synthetic vehicle-resistance parameters using explicit, full-batch gradient descent. Python computes all optimizer histories; TypeScript and CSS provide the interactive frontend. No cloud service, API keys, or runtime CDN dependencies.

## Source priority

1. Supplied ZIP dataset, metadata and README (preserved in `data/`).
2. F1 Drag Lab PDF for supplementary interaction and teaching guidance.
3. Australian GP geometry from `frontend/frontend shit/australian-grand-prix/` in the parent project.

The 65 observations are **synthetic**, not measured F1 forces. Only `speed_mps` and noisy `force_N` train the model. `noise_N` and `force_without_noise_N` are audit information. The source CSV is never modified by UI interactions.

## Setup (PowerShell, from this directory)

Prerequisites: Python 3.11+ and Node.js 22.12+ (both were already installed on the development machine).

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r backend/requirements.lock.txt
Copy-Item .env.example .env
Set-Location frontend
npm ci
npm run build
Set-Location ..
.venv/Scripts/python.exe scripts/serve.py
```

Open http://127.0.0.1:8000. The Python server serves both API and built frontend. After initial installation/build, this works offline. Virtualenv activation is optional; commands explicitly select its Python executable. If `.env` already exists, keep it rather than overwriting custom settings.

Development: run the Python server in one terminal; in another run `npm run dev` from `frontend/`. Open the Vite URL (normally http://127.0.0.1:5173). Its `/api` proxy targets port 8000. Update `vite.config.ts` if changing backend port. Rebuild after frontend changes before using the production Python URL.

## Structure

```text
backend/app/          FastAPI routes and explicit NumPy GD implementation
backend/tests/        Numerical and API validation
data/                 Original dataset, metadata, normalized track, vehicle references
frontend/src/         Typed UI, SVG visualization, responsive CSS
scripts/serve.py      .env-aware single-server entry point
.venv/                Dedicated Python environment (ignored)
.env                  Local host/port settings (ignored)
.env.example          Shared configuration template
```

## Mathematical contract

`x = (speed_mps / 50)^2`, `prediction = theta0 + theta1*x`.

`L = mean((prediction - force_N)^2)/2` (N²).

`gradient = [mean(residual), mean(x*residual)]`.

Both parameters update simultaneously: `theta -= alpha * gradient`.

`c0 = theta0`; `c2 = theta1/2500`. No target normalization, no nonnegative projection. Initial UI guesses are nonnegative; subsequent iterates are unconstrained. Two distinct squared speeds ensure strict convexity. The backend derives the constant-step stability bound from the Hessian. Iteration zero and every accepted post-update iterate are stored consistently. A convergence gradient tolerance of 1e-8 or maximum iteration count stops a stable run; loss above 1e18 stops runaway experiments and retains the last finite history.

The same noisy samples feed the direct least-squares reference. Default fit: c0 ≈ 168.099743 N, c2 ≈ 0.319755751 N·s²/m², RMSE ≈ 27.998052 N. Recovering the generating values 180 and 0.32 exactly is not expected with noisy samples. These results demonstrate numerical optimization, not real-car calibration.

## Interface

- Workstation: draggable marker / keyboard speed slider, model controls, force components, force plot, convergence and iteration replay.
- Calculus: derivatives and actual numerical parameter substitutions for the selected iterate. Start replay or drag the iteration slider back to inspect earlier steps.
- Evidence: residuals, independent learning-rate experiments, least-squares comparison, source details, dataset table, complete JSON and CSV history exports.
- Configuration changes invalidate earlier runs; generating-curve overlay is optional. CSV order is preserved; plot curves are drawn in increasing speed order.
- Dataset loading requires a running backend. Errors are visible. Reduced-motion users can inspect static output and step manually without replay.

## Track and Mercedes context

Only Australian GP geometry is used (618 points). Coordinates are fitted to the display; they do not establish metre distances or telemetry alignment. Track index maps linearly to an illustrative selectable speed, not a simulated lap-speed trace. The marker is an abstract car symbol, not an accurate W17 model.

Mercedes W17 facts come from https://www.mercedesamgf1.com/f1-w17-2026-technical-specifications (accessed 31 October 2026): 1.6 L six-cylinder ICE, maximum 15,000 rpm and published car weight 772 kg. These are context only: they do not enter `F = c0 + c2*v²`. Engine output, drag area and rolling-resistance coefficient are not inferred or fabricated. This project does not model acceleration, drivetrain, ERS or lap times and has no official team affiliation.

## Verify

```powershell
.venv/Scripts/python.exe -m pytest backend/tests -q
Set-Location frontend
npm run build
```

Tests cover finite-difference gradients, exact least-squares parity, loss monotonicity for stable updates, divergence detection and API input rejection. See API documentation at http://127.0.0.1:8000/docs.

This is a local implementation. A report, signatures, student details and report screenshots remain separate deliverables.
