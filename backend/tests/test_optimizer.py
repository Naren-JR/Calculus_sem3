import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.optimizer import fit, samples

def test_reference_parity_and_history():
    result = fit()
    last = result['history'][-1]
    assert abs(last['c0']-168.0997432434) < 1e-6
    assert abs(last['c2']-result['reference']['c2']) < 1e-9
    assert abs(last['rmse']-27.99805244) < 1e-6
    assert all(b['loss'] <= a['loss']+1e-8 for a,b in zip(result['history'],result['history'][1:]))
    assert result['history'][0]['step'] == 0

def test_gradient_finite_difference():
    rows=samples(); x=np.array([[1,(r['speed_mps']/50)**2] for r in rows]); y=np.array([r['force_N'] for r in rows]); t=np.array([100.,500.])
    analytic=x.T@(x@t-y)/len(y)
    def loss(t): return np.mean((x@t-y)**2)/2
    numeric=[(loss(t+e)-loss(t-e))/2e-3 for e in np.eye(2)*1e-3]
    assert np.allclose(analytic,numeric)

def test_divergence_and_validation():
    assert 'Diverged' in fit(learning_rate=2)['status']
    client=TestClient(app)
    assert client.get('/api/dataset').status_code == 200
    assert len(client.get('/api/dataset').json()['samples']) == 65
    assert client.post('/api/optimize',json={'learning_rate':0}).status_code == 422
