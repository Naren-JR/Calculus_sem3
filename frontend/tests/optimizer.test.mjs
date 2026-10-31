import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fit} from '../src/optimizer.ts';
const csv=readFileSync(new URL('../../data/synthetic_vehicle_resistance_dataset.csv',import.meta.url),'utf8').trim().split(/\r?\n/);
const headers=csv.shift().split(',');
const samples=csv.map(line=>Object.fromEntries(line.split(',').map((v,i)=>[headers[i],Number(v)])));
const fixtures=JSON.parse(readFileSync(new URL('./python-reference.json',import.meta.url),'utf8'));
for(const fixture of fixtures)test(`NumPy parity ${JSON.stringify(fixture.config)}`,()=>{
 const result=fit(samples,fixture.config),last=result.history.at(-1);
 for(const k of ['c0','c2','loss','rmse'])assert.ok(Math.abs(last[k]-fixture.last[k])<1e-6*Math.max(1,Math.abs(fixture.last[k])),k);
 assert.equal(result.status,fixture.status);
 assert.ok(Math.abs(result.reference.c0-fixture.reference.c0)<1e-8);
 assert.ok(Math.abs(result.stable_rate_upper_bound-fixture.bound)<1e-12);
});
test('History update follows analytic simultaneous gradient',()=>{
 const r=fit(samples,{iterations:2}),a=r.history[0],b=r.history[1];
 assert.equal(b.theta0,a.theta0-.15*a.gradient[0]);
 assert.equal(b.theta1,a.theta1-.15*a.gradient[1]);
});
test('Reject invalid inputs; retain missing/invalid force as an error',()=>{
 for(const config of [{learning_rate:0},{iterations:1.5},{initial_c0:Infinity}])assert.throws(()=>fit(samples,config));
 assert.throws(()=>fit([{speed_mps:1,force_N:10},{speed_mps:1,force_N:20}]));
 assert.throws(()=>fit([{speed_mps:1,force_N:NaN},{speed_mps:2,force_N:20}]));
});
