# F1 Drag Lab — GitHub Pages edition

Main runs entirely in the browser using TypeScript. The original Python + TypeScript app is preserved on branch `py-ts`. No backend, Python, secrets or runtime CDN is required on main.

## Local setup

Requires Node.js 24 (also used by CI).

```powershell
cd frontend
npm ci
npm run dev
```

Open the printed localhost URL. For production verification:

```powershell
npm test
npm run build
npm run preview
```

Serve through HTTP; do not double-click index.html (module workers need a web origin). Deployable files are in frontend/dist. Data and KaTeX fonts are bundled locally.

## GitHub Pages deployment

1. Commit and push main to Naren-JR/Calculus_sem3.
2. GitHub repository → Settings → Pages → Build and deployment → Source: GitHub Actions.
3. Under Actions, run Deploy Drag Lab to GitHub Pages if needed; future pushes to main trigger it automatically.
4. The workflow tests, builds and deploys frontend/dist. Its deployment summary confirms the actual live URL.

Expected URL after successful deployment: https://naren-jr.github.io/Calculus_sem3/
This is not a claim that the site has already deployed. Relative Vite asset URLs support the repository subpath. The workflow uses GitHub's built-in token; no personal token is required. The py-ts branch does not trigger deployment. Pages availability depends on repository visibility and account plan.

## Architecture

- frontend/src/optimizer.ts: explicit full-batch gradient descent, centered least-squares reference and closed-form two-by-two Hessian eigenvalue bound.
- frontend/src/optimizer.worker.ts: isolated browser computation, leaving UI responsive.
- frontend/src/data.ts: build-time import of CSV, metadata, track and vehicle references.
- frontend/src/main.ts and style.css: UI, plots, playback, equations, experiments and manual.
- frontend/tests: seven tests, including five comparisons with NumPy-generated reference fixtures.
- data: preserved authoritative synthetic dataset and Australian GP geometry.
- .github/workflows/pages.yml: main-branch test, build and deployment pipeline.

## Mathematics and evidence

F = c0 + c2*v², x = (v/50)², theta0 = c0, theta1 = 2500*c2. Loss is half mean squared force error. Gradients are mean(residual) and mean(x*residual), updated simultaneously. Target force remains in newtons. No nonnegative projection is applied. Validation bounds, tolerance 1e-8, divergence threshold 1e18 and iteration-history semantics match the Python version.

Tests cover default and alternative learning rates (including divergence), nonzero starting values, simultaneous updates and invalid inputs. JavaScript and NumPy double-precision arithmetic can differ slightly, so parity uses numerical tolerances.

The 65 observations are synthetic; fitting uses only speed_mps and force_N. Default c0 ≈ 168.099743 N, c2 ≈ 0.319755751 N·s²/m², RMSE ≈ 27.998052 N. Mercedes specifications are context only, not model inputs. Track speeds are a smoothed curvature-based illustration, not real telemetry. Colours use an absolute 0–2000 N scale. Playback shows saved calculations at 120 ms per update by default, with pause, step, scrub and Show final controls. No uploads are implemented; changing bundled data requires rebuilding.

## Original Python version

Switch to py-ts for FastAPI/NumPy. Previous README content (including existing local edits) is preserved in docs/python-version-notes.md. Its Python instructions do not apply to main. Existing ignored .venv files may remain locally but are not used or deployed. The source files for the old backend are removed on main only.
